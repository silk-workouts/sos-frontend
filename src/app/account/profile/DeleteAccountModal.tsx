// components/modals/DeleteAccountModal.tsx
"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./DeleteAccountModal.module.scss";

interface Props {
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteAccountModal({ onClose, onDelete }: Props) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Delete Your Account?</h2>
        <p>
          This action is <strong>permanent</strong>. Your account and all
          related data will be deleted and cannot be recovered.
        </p>
        <div className={styles.buttons}>
          <button className={styles.cancel} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.delete} onClick={onDelete}>
            Delete Account
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
