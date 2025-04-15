import Link from "next/link";

import styles from "./page.module.scss";

export default function AccountDeletedPage() {
  return (
    <div className={styles.accountDeleted}>
      <h1>Account Deleted</h1>
      <h2>
        Your account has been permanently removed. We're sorry to see you go.
      </h2>
      <Link href="/" className={styles.homepageLink}>
        Return to Homepage
      </Link>
    </div>
  );
}
