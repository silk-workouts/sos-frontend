// Updates required for integration with database:
// - Validating email doesn't exist (avoid duplicates)
// - Validating length of entries and email format
// - Minimum password security and/or 2x entries
// - API calls to facilitate PATCH/PUT for account details
// - Where does the change/cancel subscription link go to?

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import styles from "./page.module.scss";

//had to use React.FC because of selector styling issue - feel free to revert if you know of a solution
const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState<string>("user@example.com");
  const [password, setPassword] = useState<string>("********");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempEmail, setTempEmail] = useState<string>(email);
  const [tempPassword, setTempPassword] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const res = await fetch("/api/auth/verify-token", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          setIsLoggedIn(false);
          return;
        }
        setIsLoggedIn(true);
      } catch (error) {
        setIsLoggedIn(false);
      }
    }

    checkAuthStatus();
  }, []);

  const handleEditClick = (): void => {
    setIsEditing(true);
    setTempEmail(email);
    setTempPassword("");
  };

  const handleCancelClick = (): void => {
    setIsEditing(false);
    setMessage("");
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "GET" });
    setIsLoggedIn(false);
    router.push("/");
  };

  const handleSaveProfile = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    // Validate email format
    if (!tempEmail.includes("@")) {
      setMessage("Invalid email format.");
      setIsLoading(false);
      return;
    }

    // Validate password length (adjustable based on security requirements)
    if (tempPassword.length > 0 && tempPassword.length < 6) {
      setMessage("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }

    try {
      // API call to check if email already exists (avoid duplicates)
      const emailCheckRes = await fetch(
        `/api/auth/check-email?email=${tempEmail}`
      );
      if (!emailCheckRes.ok) {
        setMessage("Email already exists.");
        setIsLoading(false);
        return;
      }

      // API call to update user profile (PATCH or PUT)
      const updateRes = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: tempEmail !== email ? tempEmail : undefined,
          password: tempPassword.length > 0 ? tempPassword : undefined,
        }),
      });

      if (!updateRes.ok) {
        setMessage("Error updating profile. Please try again.");
        setIsLoading(false);
        return;
      }

      // Update state only after a successful update
      setEmail(tempEmail);
      setPassword("********"); // Hide updated password for security reasons
      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Error updating profile. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profile__header}>
        <h2 className={styles.profile__title}>Profile</h2>
        {!isEditing && (
          <button
            className={styles.profile__editButton}
            onClick={handleEditClick}
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing ? (
        <>
          <div className={styles.profile__info}>
            <div className={styles.profile__infoGroup}>
              <span className={styles.profile__label}>Email</span>
              <span className={styles.profile__value}>{email}</span>
            </div>
            <div className={styles.profile__infoGroup}>
              <span className={styles.profile__label}>Password</span>
              <span className={styles.profile__value}>********</span>
            </div>
          </div>

          {/* Additional Profile Links */}
          <div className={styles.profile__links}>
            <Link
              href="/dashboard/cancel-subscription"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              Cancel Subscription
            </Link>
            {/* <Link
              href="/about"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              Help
            </Link> */}
            <Link
              href="/contact"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              FAQ
            </Link>
          </div>

          {/* Logout Button - Uses Header's Logout Functionality */}
          {isLoggedIn && (
            <Button
              variant="tertiary"
              className={styles.profile__logoutButton}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          )}
        </>
      ) : (
        <form className={styles.profile__form} onSubmit={handleSaveProfile}>
          <div className={styles.profile__inputGroup}>
            <label className={styles.profile__label}>Email*</label>
            <input
              type="email"
              className={styles.profile__input}
              value={tempEmail}
              onChange={(e) => setTempEmail(e.target.value)}
            />
          </div>

          <div className={styles.profile__inputGroup}>
            <label className={styles.profile__label}>New Password*</label>
            <input
              type="password"
              className={styles.profile__input}
              placeholder="Enter new password"
              value={tempPassword}
              onChange={(e) => setTempPassword(e.target.value)}
            />
          </div>

          {/* Buttons now appear immediately below the input fields */}
          <div className={styles.profile__buttonGroup}>
            <Button variant="text" onClick={handleCancelClick}>
              Cancel
            </Button>
            <Button type="submit" variant="tertiary">
              {isLoading ? "Updating..." : "Save Profile"}
            </Button>
          </div>
        </form>
      )}

      {message && <p className={styles.profile__message}>{message}</p>}
    </div>
  );
};

export default ProfilePage;
