import { Suspense } from "react";
import StripeSuccessClient from "@/components/StripeSuccess/StripeSuccess";

import styles from "./page.module.scss";

export default function StripeSuccessPage() {
  return (
    <div className={styles.subscribeSuccess}>
      <h1>Finishing up your subscription...</h1>

      <Suspense fallback={<p>Loading...</p>}>
        <StripeSuccessClient />
      </Suspense>
    </div>
  );
}
