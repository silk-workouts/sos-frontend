"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ContinuousVideo } from "src/app/(dashboard)/dashboard/page";
import ElementFilter from "../ElementFilter/ElementFilter";
import VideoList from "../VideoList/VideoList";
import styles from "./DashboardPageContent.module.scss";

interface ContentProps {
  continuousVideos: ContinuousVideo[];
  type: string;
}
export default function DashboardPageContent({
  continuousVideos,
  type,
}: ContentProps) {
  const searchParams = useSearchParams()!;
  const router = useRouter();
  const [elementFilter, setElementFilter] = useState<Set<string>>(new Set());

  function handleFilter(filter: string) {
    if (elementFilter.has(filter)) {
      setElementFilter(new Set([...elementFilter].filter((x) => x !== filter)));
    } else {
      setElementFilter(new Set([...elementFilter, filter]));
    }
  }

  let filteredcontinuousVideos = continuousVideos;
  if (elementFilter.size > 0) {
    filteredcontinuousVideos = continuousVideos.filter((video) =>
      [...elementFilter].some((filter) =>
        video.name.toLowerCase().includes(filter)
      )
    );
  }

  useEffect(() => {
    if (searchParams.get("refresh")) {
      router.replace("/dashboard"); // Remove refresh param and reload
    }
  }, [searchParams, router]);

  return (
    <>
      {type === "element" && (
        <ElementFilter
          elementFilter={elementFilter}
          handleFilter={handleFilter}
        />
      )}
      <ul className={styles.list} role="list">
        {filteredcontinuousVideos.map((video) => {
          return (
            <li key={video.id} className={styles.listItem}>
              {" "}
              <VideoList video={video} type={type} />
            </li>
          );
        })}
      </ul>
    </>
  );
}
