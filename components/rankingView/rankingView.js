"use client";

import styles from "./rankingView.module.css";
import { RankingTable, UserRank } from "../rankingTable/rankingTable";
import { useMemo } from "react";
import { Female, Male } from "../icon/icon";
import { Progress } from "../progress/progress";
import calculatePercentage from "../../utilties/calculatePercentage";
import { parseDate } from "../../utilties/parseDate";
import { IconButton } from "../iconButton/iconButton";

export default function RankingView({ ranking, boulderCount }) {
  const columns = useMemo(() => {
    return [
      {
        Header: "Rank",
        accessor: "rank",
        className: styles.rankCell,
        Cell: ({ value }) => {
          return <strong>{value}</strong>;
        },
      },
      {
        Header: "User",
        accessor: "user.username",
        className: styles.nameCell,
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
        sortType: (a, b) => {
          return a.values.points - b.values.points;
        },
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
        Header: () => null,
        id: "expander",
        className: styles.expanderCell,
        Cell: ({ row }) => (
          <IconButton
            icon={row.isExpanded ? "close" : "plus"}
            outline={false}
            {...row.getToggleRowExpandedProps()}
          />
        ),
      },
    ];
  }, [boulderCount]);

  return (
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
  );
}
