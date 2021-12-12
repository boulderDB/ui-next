import { useHttp } from "../../hooks/useHttp";
import useDrawer from "../../hooks/useDrawer";
import { useSWRConfig } from "swr";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../pages/_app";
import useBoulderFilters from "../../hooks/useBoulderFilters";
import filterPresentOptions from "../../utilties/filterPresentOptions";
import sortItemsAlphabetically from "../../utilties/sortItemsAlphabetically";
import BoulderTable, {
  ascentTypes,
  columns,
  filters as boulderFilters,
} from "../boulderTable/boulderTable";
import HoldType from "../holdType/holdType";
import Grade from "../grade/grade";
import styles from "./boulderView.module.css";
import DetailButton from "../boulderTable/detailButton";
import Ascents from "../boulderTable/ascents";
import IndeterminateCheckbox from "../table/IndeterminateCheckbox";
import Link from "next/link";
import cn from "classnames";
import { typography } from "../../styles/utilities";
import toast from "../../utilties/toast";
import AscentIcon from "../ascentIcon/ascentIcon";
import RateButton from "../boulderTable/rateButton";
import extractErrorMessage from "../../utilties/extractErrorMessage";
import Loader from "../loader/loader";
import Select from "../select/select";
import GlobalFilter from "../boulderTable/globalFilter";
import CollapsedRow from "../boulderTable/collapsedRow";
import Drawer from "../drawer/drawer";
import BoulderDetail from "../boulderDetail/boulderDetail";
import Bar from "../bar/bar";
import Button from "../button/button";
import Tooltip from "../tooltip/tooltip";
import WallDetail from "../wallDetail/wallDetail";

export default function BoulderView({ boulders, event, initialFilters = [] }) {
  const http = useHttp();
  const { setOpen } = useDrawer();
  const { mutate } = useSWRConfig();

  const { currentLocation, dispatchMessage, roles } = useContext(AppContext);
  const isAdmin = roles?.includes("admin");

  const [detailWall, setDetailWall] = useState(null);
  const [detailBoulder, setDetailBoulder] = useState(null);
  const [selected, setSelected] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  useEffect(() => {
    if (detailWall || detailBoulder) {
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [detailWall, detailBoulder]);

  const { filters, setFilters, applyFilter } = useBoulderFilters(
    initialFilters
  );

  const grades = useMemo(
    () =>
      filterPresentOptions(boulders, "grade", "id").sort((a, b) =>
        a.name > b.name ? 1 : -1
      ),
    [boulders]
  );

  const holdTypes = useMemo(
    () =>
      sortItemsAlphabetically(
        filterPresentOptions(boulders, "holdType"),
        "name"
      ),
    [boulders]
  );

  const walls = useMemo(
    () =>
      sortItemsAlphabetically(
        filterPresentOptions(boulders, "startWall"),
        "name"
      ),
    [boulders]
  );

  const setters = useMemo(
    () =>
      sortItemsAlphabetically(
        filterPresentOptions(boulders, "setters"),
        "username"
      ),
    [boulders]
  );

  const areas = useMemo(
    () =>
      sortItemsAlphabetically(filterPresentOptions(boulders, "areas"), "name"),
    [boulders]
  );

  const tableColumns = useMemo(() => {
    const defaultColumns = [
      {
        ...columns.holdType,
        Cell: ({ value, row }) => (
          <Tooltip title={row.original.holdType.name}>
            <HoldType image={value.image} />
          </Tooltip>
        ),
      },
      {
        ...columns.grade,
        Cell: ({ value }) => {
          if (isAdmin && value.internal) {
            return (
              <Grade
                name={value.name}
                color={value.color}
                internalName={value.internal.name}
                internalColor={value.internal.color}
              />
            );
          }

          return <Grade name={value.name} color={value.color} />;
        },
      },
      {
        ...columns.points,
        className: styles.pointsCell,
        Cell: ({ value }) => `${value} pts`,
      },
      {
        ...columns.name,
        Cell: ({ value, row }) => {
          const boulderId = row.original.id;

          return (
            <DetailButton
              active={detailBoulder === boulderId}
              boulderId={boulderId}
              onClick={() => {
                setDetailBoulder(boulderId);
              }}
            >
              {value}
            </DetailButton>
          );
        },
      },
      {
        ...columns.startWall,
        Cell: ({ value, row }) => (
          <span
            className={styles.wallLink}
            onClick={() => {
              setDetailWall(row.original.startWall.id);
            }}
          >
            {value.name}
          </span>
        ),
      },
      {
        ...columns.endWall,
        className: styles.endWallCell,
        Cell: ({ value, row }) => (
          <span
            className={styles.wallLink}
            onClick={() => {
              setDetailWall(row.original.endWall?.id);
            }}
          >
            {value.name}
          </span>
        ),
      },
      {
        ...columns.setters,
        className: styles.setterCell,
        Cell: ({ value }) => <span>{value}</span>,
      },
      {
        ...columns.date,
      },
      {
        ...columns.ascent,
        Cell: ({ value, row }) => (
          <Ascents
            onAdd={addHandler}
            onRemove={removeHandler}
            boulderId={row.original.id}
            userAscent={value}
          />
        ),
      },
      {
        ...columns.area,
        Cell: ({ value, row }) => null,
      },
    ];

    if (isAdmin) {
      defaultColumns.unshift({
        ...columns.selection,
        Cell: ({ row }) => (
          <div className={styles.editCell}>
            <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />

            <Link
              href={`/${currentLocation?.url}/admin/boulders/${row.original.id}`}
            >
              <a className={cn(typography.eta, styles.editLink)}>✏️</a>
            </Link>
          </div>
        ),
      });
    }

    return defaultColumns;
  }, [isAdmin, detailBoulder]);

  const addHandler = useCallback(async (boulder, type) => {
    try {
      await http.post(`/${currentLocation?.url}/ascents`, {
        boulder,
        type,
      });

      mutate(`/${currentLocation?.url}/boulders`);

      if (event) {
        mutate(`/${currentLocation?.url}/events/${event.id}`);
      }

      dispatchMessage(
        toast(
          "Ascent added",
          <>
            <span>
              <AscentIcon type={type} fill={true} />+{"points"}
            </span>

            <div className={styles.rating}>
              <span>Leave a rating:</span>

              <RateButton direction={"up"} boulderId={boulder} />

              <span>/</span>

              <RateButton direction={"down"} boulderId={boulder} />
            </div>
          </>,
          "info",
          4000
        )
      );
    } catch (error) {
      dispatchMessage(toast("Error", extractErrorMessage(error), "error"));
    }
  }, []);

  const removeHandler = useCallback(async ({ id }) => {
    try {
      await http.delete(`/${currentLocation?.url}/ascents/${id}`);

      mutate(`/${currentLocation?.url}/boulders`);

      if (event) {
        mutate(`/${currentLocation?.url}/events/${event.id}`);
      }
    } catch (error) {
      dispatchMessage(toast("Error", extractErrorMessage(error), "error"));
    }
  }, []);

  const resolveFilterValue = (id, options, property = "name") => {
    if (!filters) {
      return null;
    }

    const filter = filters.find((filter) => filter.id === id);

    if (!filter) {
      return null;
    }

    return options.find((option) => option[property] === filter.value);
  };

  if (!boulders) {
    return <Loader />;
  }

  return (
    <>
      <div className={styles.filters}>
        <Select
          {...boulderFilters.area}
          value={resolveFilterValue("area", areas)}
          options={areas}
          onChange={(event, newValue) => {
            applyFilter("area", newValue ? newValue.name : null);
          }}
          items={areas}
        />

        <Select
          {...boulderFilters.holdType}
          value={resolveFilterValue("holdType", holdTypes)}
          options={holdTypes}
          onChange={(event, newValue) =>
            applyFilter("holdType", newValue ? newValue.name : null)
          }
          items={holdTypes}
        />

        <Select
          {...boulderFilters.grade}
          value={resolveFilterValue("grade", grades)}
          options={grades}
          onChange={(event, newValue) =>
            applyFilter("grade", newValue ? newValue.name : null)
          }
          items={grades}
        />

        <Select
          {...boulderFilters.wall}
          value={resolveFilterValue("start", walls)}
          options={walls}
          label={"Start"}
          onChange={(event, newValue) =>
            applyFilter("start", newValue ? newValue.name : null)
          }
          items={walls}
        />

        <Select
          {...boulderFilters.wall}
          label={"End"}
          value={resolveFilterValue("end", walls)}
          options={walls}
          onChange={(event, newValue) =>
            applyFilter("end", newValue ? newValue.name : null)
          }
          items={walls}
        />

        <Select
          {...boulderFilters.setter}
          value={resolveFilterValue("setter", setters, "username")}
          options={setters}
          onChange={(event, newValue) => {
            applyFilter("setter", newValue ? newValue.username : null);
          }}
        />

        <Select
          {...boulderFilters.ascent}
          value={resolveFilterValue("ascent", ascentTypes, "id")}
          onChange={(event, newValue) => {
            applyFilter("ascent", newValue ? newValue.id : null);
          }}
        />
      </div>

      <GlobalFilter
        filters={filters}
        setFilters={setFilters}
        setGlobalFilter={setGlobalFilter}
        globalFilter={globalFilter}
      />

      <BoulderTable
        columns={tableColumns}
        data={boulders}
        filters={filters}
        globalFilter={globalFilter}
        onSelectRows={(ids) => setSelected(ids)}
        isAdmin={isAdmin}
        headerClassName={cn(
          styles.tableHeader,
          isAdmin ? styles.isAdminTableHeader : null
        )}
        rowClassName={isAdmin ? styles.isAdminTableRow : styles.tableRow}
        collapsedRowRenderer={(cells) => <CollapsedRow cells={cells} />}
      />

      <Drawer
        onClose={() => {
          setDetailBoulder(null);
          setDetailWall(null);
        }}
      >
        {detailBoulder && <BoulderDetail id={detailBoulder} />}
        {detailWall && <WallDetail id={detailWall} />}
      </Drawer>

      <Bar visible={selected.length > 0}>
        <span className={typography.gamma}>Selected ({selected.length})</span>

        <span className={styles.barButtons}>
          <Button
            variant={"danger"}
            onClick={async () => {
              try {
                await http.put(`/${currentLocation?.url}/boulders/mass`, {
                  items: selected,
                  operation: "deactivate",
                });

                mutate(`/${currentLocation?.url}/boulders`);
              } catch (error) {
                dispatchMessage(toast(error));
              }
            }}
          >
            Deactivate
          </Button>
        </span>
      </Bar>
    </>
  );
}