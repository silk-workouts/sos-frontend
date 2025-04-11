"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Button from "@/components/ui/Button/Button";
import { usePlaylists } from "../../(dashboard)/dashboard/context/PlaylistContext";
import styles from "./DeleteAccountModal.module.scss";

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const [isDeleting, setIsDeleting] = useState(false);

  const { userId } = usePlaylists();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const tokenRes = await axios.get("/api/auth/verify-token", {
        withCredentials: true,
      });

      const { userId, token } = tokenRes.data;

      if (!token || !userId) {
        throw new Error("Missing token or user ID");
      }

      if (!token) {
        toast.error("Could not verify session. Please refresh and try again.");
        return;
      }

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      const res = await axios.request({
        url: "/api/account/delete",
        method: "DELETE",
        data: { userId, token },
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (res.status === 200) {
        toast.success("Account deleted successfully.");
        onClose();
        window.location.href = "/account-deleted";
      } else {
        toast.error("Failed to delete account.");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      toast.error("Something went wrong.");
    } finally {
      setIsDeleting(false);
    }
  };

  return createPortal(
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2>Delete Your Account?</h2>
        <p>
          This action is <strong>permanent</strong>.<br />
          Your account, and all related data will be deleted and cannot be
          recovered.
        </p>
        <div className={styles.deleteButtons}>
          <Button
            variant="secondary"
            className={styles.cancel}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="secondary"
            className={styles.delete}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Button>
        </div>
      </div>
      <Toaster position="top-center" />
    </div>,
    document.body
  );
}
