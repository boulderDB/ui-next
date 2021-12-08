import Layout from "../../../components/layout/layout";
import Meta from "../../../components/meta/meta";
import { colors, layoutStyles, typography } from "../../../styles/utilities";
import cn from "classnames";
import {
  RankingTable,
  UserRank,
} from "../../../components/rankingTable/rankingTable";
import styles from "./current.module.css";
import { useContext, useMemo } from "react";
import { Female, Male } from "../../../components/icon/icon";
import { Progress } from "../../../components/progress/progress";
import Link from "next/link";
import { AppContext } from "../../_app";
import calculatePercentage from "../../../utilties/calculatePercentage";
import parseDate from "../../../utilties/parseDate";
import { useCachedHttp } from "../../../hooks/useHttp";
import Loader from "../../../components/loader/loader";

export default function Current() {
  const { tokenPayload, currentLocation } = useContext(AppContext);
  const user = tokenPayload?.user;

  const ranking = useCachedHttp(`/${currentLocation?.url}/rankings/current`);
  const boulderCount = useCachedHttp(`/${currentLocation?.url}/boulders/count`);

  const columns = useMemo(() => {
    return [
      {
        Header: "Rank",
        accessor: "rank",
        Cell: ({ value }) => {
          return <strong>{value}</strong>;
        },
      },
      {
        Header: "User",
        accessor: "user.username",
        Cell: ({ cell, row }) => (
          <UserRank
            username={cell.value}
            image={row.original.user.image}
            sentAllBoulders={row.original.boulder === boulderCount}
          />
        ),
      },
      {
        Header: "Gender",
        accessor: "user.gender",
        className: styles.genderCell,
        Cell: ({ cell }) => {
          if (cell.value === "male") {
            return <Male />;
          }

          if (cell.value === "female") {
            return <Female />;
          }

          return "-";
        },
      },
      {
        Header: "Points",
        accessor: "points",
        className: styles.pointsCell,
      },
      {
        Header: "Advance",
        accessor: "advance",
        className: styles.advanceCell,
      },
      {
        Header: "Boulders",
        accessor: "total.count",
        className: styles.bouldersCell,
        Cell: ({ cell }) => {
          return <Progress percentage={(cell.value / boulderCount) * 100} />;
        },
      },
      {
        Header: "Flashed",
        accessor: "flash.count",
        className: styles.flashedCell,
        Cell: ({ cell }) => calculatePercentage(cell.value, boulderCount),
      },
      {
        Header: "Topped",
        accessor: "top.count",
        gridTemplate: "100px",
        className: styles.toppedCell,
        Cell: ({ cell }) => calculatePercentage(cell.value, boulderCount),
      },
      {
        Header: "Last activity",
        accessor: "user.lastActivity",
        className: styles.lastActivityCell,
        Cell: ({ cell }) => {
          return <span>{parseDate(cell.value).string}</span>;
        },
      },
      {
        Header: "",
        id: "user.id",
        accessor: "user.id",
        className: styles.compareCell,
        Cell: ({ cell }) => {
          if (parseInt(cell.value) === parseInt(user?.id)) {
            return null;
          }

          return null;

          return (
            <Link href={`/compare/${user?.id}/to/${cell.value}/at/current`}>
              <a className={cn(typography.delta700, colors.lila)}>Compare</a>
            </Link>
          );
        },
      },
    ];
  }, [boulderCount, user]);

  if (!ranking) {
    return <Loader />;
  }

  return (
    <Layout>
      <Meta title={"Current ranking"} />

      <div className={layoutStyles.grid}>
        <h1 className={cn(layoutStyles.sideTitle, typography.alpha700)}>
          Current ranking
        </h1>

        <div className={layoutStyles.sideContent}>
          <RankingTable
            data={ranking?.map((rank, index) => {
              return {
                ...rank,
                rank: index + 1,
              };
            })}
            columns={columns}
            rowClassName={styles.tableRow}
            headerClassName={styles.tableHeader}
          />
        </div>
      </div>
    </Layout>
  );
}
