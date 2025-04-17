"use client";

import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import { Suspense, useEffect, useState } from "react";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import logo from "/public/assets/images/logo.png";
import DashboardPageContent from "@/components/pages/dashboard/DashboardPageContent/DashboardPageContent";
import styles from "./page.module.scss";

export interface ContinuousVideo {
  id: number;
  continuous_video_id: string;
  continuous_video_title: string;
  name: string;
  thumbnail_url: string;
  created_at: string;
  description: string;
}

export default function DashboardPage() {
  const [continuousVideos, setContinuousVideos] = useState<ContinuousVideo[]>(
    []
  );
  const [isSelected, setIsSelected] = useState({
    element: true,
    program: false,
  });

  function handleSelect(selected: boolean) {
    if (!selected) {
      const newSelection = {
        element: !isSelected.element,
        program: !isSelected.program,
      };

      setIsSelected(newSelection);
      sessionStorage.setItem("dashboardTab", JSON.stringify(newSelection));
    }
  }

  useEffect(() => {
    async function getContinuousVideos() {
      try {
        const response = await axios.get(`/api/continuous-videos`);

        setContinuousVideos(response.data.continuousVideos);
      } catch (error) {
        console.error(
          `Unable to retrieve showcase videos from Vimeo: ${error}`
        );
      }
    }

    getContinuousVideos();

    //Get the last selected tab
    const selectedTab = sessionStorage.getItem("dashboardTab");

    if (selectedTab) {
      setIsSelected(JSON.parse(selectedTab));
    }
  }, []);

  //filter showcase videos by element or prescription programs
  const filteredContinuousVideos = continuousVideos.filter(
    (video: ContinuousVideo) =>
      isSelected.program
        ? video.name.toLowerCase().includes("prescription")
        : !video.name.toLowerCase().includes("prescription")
  );

  if (isSelected.element) {
    filteredContinuousVideos.sort((a, b) => (a.name > b.name ? 1 : -1));
  } else {
    filteredContinuousVideos.sort((a, b) =>
      a.name
        .toLowerCase()
        .localeCompare(b.name.toLowerCase(), undefined, { numeric: true })
    );
  }

  return (
    <Suspense
      fallback={
        <div className={styles.loading}>
          <Image
            src={loadingSpinner}
            alt={`Workout videos are loading`}
            width={36}
            height={36}
            className={styles.spinner}
          />
        </div>
      }
    >
      <div className={styles.container}>
        <div className={styles["tab-container"]}>
          <Link href="/dashboard">
            <Image
              src={logo}
              width={300}
              alt="System of Silk logo"
              className={styles.container__logo}
            />
          </Link>
          <ul className={styles.tabContent} role="tablist" tabIndex={0}>
            <li
              role="tab"
              tabIndex={isSelected.element ? 0 : -1}
              id="element-tab"
              aria-selected={isSelected.element}
              aria-controls="element-panel"
              className={`${styles.tab} ${
                isSelected.element ? styles["tab--selected"] : ""
              }`}
              onClick={() => {
                handleSelect(isSelected.element);
              }}
            >
              elements
            </li>
            <li
              role="tab"
              tabIndex={isSelected.program ? 0 : -1}
              id="program-tab"
              aria-selected={isSelected.program}
              aria-controls="program-panel"
              className={`${styles.tab} ${
                isSelected.program ? styles["tab--selected"] : ""
              }`}
              onClick={() => {
                handleSelect(isSelected.program);
              }}
            >
              100% prescription programs
            </li>
          </ul>
        </div>
        <div
          id="element-panel"
          role="tabpanel"
          aria-labelledby="element-tab"
          hidden={!isSelected.element}
          className={styles.content}
        >
          <DashboardPageContent
            continuousVideos={filteredContinuousVideos}
            type="element"
          />
        </div>
        <div
          id="program-panel"
          role="tabpanel"
          aria-labelledby="program-tab"
          hidden={!isSelected.program}
          className={styles.content}
        >
          <DashboardPageContent
            continuousVideos={filteredContinuousVideos}
            type="program"
          />
        </div>
      </div>
    </Suspense>
  );
}
