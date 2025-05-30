"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LibraryPageContent from "@/components/pages/library/LibraryPageContent/LibraryPageContent";
import { usePlaylists } from "../context/PlaylistContext";
import { useSavedPrograms } from "src/hooks/useSavedPrograms";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import logo from "/public/assets/images/large-S.png";
import styles from "./page.module.scss";

export default function Library() {
  const { playlists, loading, error } = usePlaylists();
  const {
    savedPrograms,
    loading: savedLoading,
    refreshSavedPrograms,
  } = useSavedPrograms(); // ✅ Add refreshSavedPrograms
  const [isSelected, setIsSelected] = useState({
    myWorkout: true,
    program: false,
  });

  function handleSelect(selected: boolean) {
    if (!selected) {
      const newSelection = {
        myWorkout: !isSelected.myWorkout,
        program: !isSelected.program,
      };

      setIsSelected(newSelection);
      sessionStorage.setItem("libraryTab", JSON.stringify(newSelection));
    }
  }

  useEffect(() => {
    //Get the last selected tab
    const selectedTab = sessionStorage.getItem("libraryTab");

    if (selectedTab) {
      setIsSelected(JSON.parse(selectedTab));
    }
  }, []);

  return (
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
            tabIndex={isSelected.myWorkout ? 0 : -1}
            id="myWorkout-tab"
            aria-selected={isSelected.myWorkout}
            aria-controls="myWorkout-panel"
            className={`${styles.tab} ${
              isSelected.myWorkout ? styles["tab--selected"] : ""
            }`}
            onClick={() => {
              handleSelect(isSelected.myWorkout);
            }}
          >
            my workouts
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
            saved programs
          </li>
        </ul>
      </div>

      {error && <div className={styles.error}>Error loading playlists</div>}

      {/* Handle loading states for both playlists and saved programs */}
      {loading || savedLoading ? (
        <div className={styles.loading}>
          <Image
            src={loadingSpinner}
            alt={`Workout playlists are loading`}
            width={36}
            height={36}
            className={styles.spinner}
          />
        </div>
      ) : (
        <>
          {!error && (
            <>
              {/* My Formulas Section */}
              <div
                id="myWorkout-panel"
                role="tabpanel"
                aria-labelledby="myWorkout-tab"
                hidden={!isSelected.myWorkout}
                className={styles.content}
              >
                <LibraryPageContent playlists={playlists} type="myWorkout" />
              </div>
              {/* Saved Programs Section */}
              <div
                id="program-panel"
                role="tabpanel"
                aria-labelledby="program-tab"
                hidden={!isSelected.program}
                className={styles.content}
              >
                <LibraryPageContent
                  savedPrograms={savedPrograms}
                  refreshSavedPrograms={refreshSavedPrograms}
                  type="program"
                />{" "}
                {/* ✅ Pass refresh function */}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
