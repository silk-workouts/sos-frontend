import { Suspense } from "react";
import Image from "next/image";
import StripeSuccessClient from "@/components/StripeSuccess/StripeSuccess";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import styles from "./page.module.scss";

export default function StripeSuccessPage() {
  return (
    <div className={styles.subscribeSuccess}>
      <h1>
        <span>Finishing up your subscription </span>{" "}
        <Image
          src={loadingSpinner}
          alt={`List of playlists is loading`}
          width={30}
          height={30}
          className={styles.icon}
        />
      </h1>

      <Suspense fallback={<p>Loading...</p>}>
        <StripeSuccessClient />
      </Suspense>
    </div>
  );
}
