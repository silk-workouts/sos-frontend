// Updates required for integration with database:
// - API calls to facilitate PATCH/PUT for account details
// - Where does the change/cancel subscription link go to?

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import loadingSpinner from "/public/assets/gifs/spinner.svg";
import DeleteAccountModal from "./DeleteAccountModal";
import Button from "@/components/ui/Button/Button";
import {
  sanitizeInput,
  isValidName,
  isValidAge,
  isValidLocation,
  isValidGender,
  isValidFitnessLevel,
} from "src/utils/inputUtils";
import styles from "./page.module.scss";

const ProfilePage: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("user@example.com");
  const [age, setAge] = useState<number | undefined>();
  const [location, setLocation] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempName, setTempName] = useState<string>(name);
  const [tempAge, setTempAge] = useState<number | undefined>(age);
  const [tempLocation, setTempLocation] = useState<string>(location);
  const [tempGender, setTempGender] = useState<string>(gender);
  const [tempFitnessLevel, setTempFitnessLevel] =
    useState<string>(fitnessLevel);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userId, setUserId] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      try {
        const tokenRes = await fetch("/api/auth/verify-token", {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!tokenRes.ok) {
          setIsLoggedIn(false);
          return;
        }

        const { userId } = await tokenRes.json();
        setUserId(userId);
        setIsLoggedIn(true);

        const profileRes = await fetch(`/api/users/get-user?id=${userId}`, {
          method: "GET",
          credentials: "include",
        });

        if (!profileRes.ok) return;

        const data = await profileRes.json();
        setName(data.user_name || "");
        setEmail(data.email || "");
        setAge(data.age ?? undefined);
        setLocation(data.location || "");
        setGender(data.gender || "");
        setFitnessLevel(data.fitness_level || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, []);

  const handleEditClick = (): void => {
    setIsEditing(true);
    setTempName(name);
    setTempAge(age);
    setTempLocation(location);
    setTempGender(gender);
    setTempFitnessLevel(fitnessLevel);
  };

  const handleCancelClick = (): void => {
    setIsEditing(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "GET" });
    setIsLoggedIn(false);
    router.push("/");
  };

  const handleSaveProfile = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setIsLoading(true);

    // Sanitize the location input
    const sanitizedLocation = sanitizeInput(tempLocation.trim());

    // Validate inputs using utility functions
    if (!isValidName(tempName)) {
      toast.error("Please enter a valid name (1-50 characters).");
      setIsLoading(false);
      return;
    }

    // Validate inputs using utility functions
    if (!isValidAge(tempAge)) {
      toast.error("Please enter a valid age between 13 and 120");
      setIsLoading(false);
      return;
    }

    if (!isValidLocation(sanitizedLocation)) {
      toast.error("Location must be under 100 characters.");
      setIsLoading(false);
      return;
    }

    if (!isValidGender(tempGender)) {
      toast.error("Please select a valid gender.");
      setIsLoading(false);
      return;
    }

    if (!isValidFitnessLevel(tempFitnessLevel)) {
      toast.error("Please select a valid fitness level.");
      setIsLoading(false);
      return;
    }

    try {
      const updateRes = await fetch("/api/users/update-profile", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: tempName,
          age: tempAge,
          location: tempLocation,
          gender: tempGender,
          fitnessLevel: tempFitnessLevel,
        }),
      });

      if (!updateRes.ok) {
        toast.error("Error updating profile. Please try again.");
        setIsLoading(false);
        return;
      }

      setName(tempName);
      setTempName(tempName);
      setAge(tempAge);
      setTempAge(tempAge);
      setLocation(tempLocation);
      setTempLocation(tempLocation);
      setGender(tempGender);
      setTempGender(tempGender);
      setFitnessLevel(tempFitnessLevel);
      setTempFitnessLevel(tempFitnessLevel);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Error updating profile. Try again.");
      console.error(`Unable to update profile: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profile__header}>
        <h1 className={styles.profile__title}>
          {isEditing ? "Edit Profile" : "Profile"}
        </h1>
        {!isEditing && (
          <button
            className={styles.profile__editButton}
            onClick={handleEditClick}
          >
            Edit
          </button>
        )}
      </div>

      {!isEditing && (
        <section className={styles.profile__info}>
          {isLoadingProfile ? (
            <div className={styles.loading}>
              <Image
                src={loadingSpinner}
                alt={`Profile information is loading`}
                width={36}
                height={36}
                className={styles.spinner}
              />
            </div>
          ) : (
            <>
              <div
                className={`${styles.profile__infoGroup} ${styles.profile__name}`}
              >
                <span className={styles.profile__label}>Name</span>
                <span className={styles.profile__value}>
                  {name || "silk system user"}
                </span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Email</span>
                <span className={styles.profile__value}>{email}</span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Age</span>
                <span className={styles.profile__value}>{age ?? "N/A"}</span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Location</span>
                <span className={styles.profile__value}>
                  {location || "N/A"}
                </span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Gender</span>
                <span
                  className={`${styles.profile__value} ${styles.capitalize}`}
                >
                  {gender || "N/A"}
                </span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Fitness Level</span>
                <span
                  className={`${styles.profile__value} ${styles.capitalize}`}
                >
                  {fitnessLevel || "N/A"}
                </span>
              </div>
            </>
          )}
        </section>
      )}

      {isEditing && (
        <form className={styles.profile__form} onSubmit={handleSaveProfile}>
          <div className={styles.profile__inputGroup}>
            <label htmlFor="name" className={styles.profile__label}>
              Name
            </label>
            <input
              id="name"
              type="text"
              className={styles.profile__input}
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
          </div>

          <div className={styles.profile__inputGroup}>
            <label htmlFor="age" className={styles.profile__label}>
              Age
            </label>
            <input
              id="age"
              type="number"
              min={0}
              className={styles.profile__input}
              value={tempAge ?? ""}
              onChange={(e) => {
                const value = e.target.value;
                setTempAge(value === "" ? undefined : Number(value));
              }}
            />
          </div>

          <div className={styles.profile__inputGroup}>
            <label htmlFor="location" className={styles.profile__label}>
              Location
            </label>
            <input
              id="location"
              type="text"
              className={styles.profile__input}
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
            />
          </div>

          <div className={styles.profile__inputGroup}>
            <label htmlFor="gender" className={styles.profile__label}>
              Gender
            </label>
            <select
              id="gender"
              className={styles.profile__input}
              value={tempGender}
              onChange={(e) => setTempGender(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non-binary">Non-binary</option>
              <option value="prefer not to say">Prefer not to say</option>
            </select>
          </div>

          <div className={styles.profile__inputGroup}>
            <label htmlFor="fitness" className={styles.profile__label}>
              Fitness Level
            </label>
            <select
              id="fitness"
              className={styles.profile__input}
              value={tempFitnessLevel}
              onChange={(e) => setTempFitnessLevel(e.target.value)}
            >
              <option value="">Select...</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className={styles.profile__buttonGroup}>
            <Button
              variant="text"
              onClick={handleCancelClick}
              className={styles.profile__cancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="secondary"
              className={styles.profile__saveProfileButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className={styles.loadingText}>
                  <Image
                    src={loadingSpinner}
                    alt=""
                    width={20}
                    height={20}
                    aria-hidden="true"
                    className={styles.icon}
                  />
                  <span className={styles.text}>Updating</span>
                </span>
              ) : (
                <span className={styles.text}>Save Profile</span>
              )}
            </Button>
          </div>
        </form>
      )}

      {!isEditing && (
        <div className={styles.profile__actions}>
          {isLoggedIn && (
            <Button
              variant="secondary"
              className={styles.profile__logoutButton}
              onClick={handleLogout}
            >
              Log Out
            </Button>
          )}
          <div className={styles.profile__links}>
            <Link
              href="/auth/forgot-password"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              Change Password
            </Link>
            <a
              href="mailto:michaelolajidejr@gmail.com"
              className={styles.profile__link}
            >
              {" "}
              Request Email Update
            </a>

            <Link
              href="/dashboard/cancel-subscription"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              Cancel Subscription
            </Link>
            <Link
              href="/contact"
              rel="noopener noreferrer"
              className={styles.profile__link}
            >
              FAQ
            </Link>
            <span
              className={styles.profile__link}
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </span>
          </div>
        </div>
      )}
      {showDeleteModal && (
        <DeleteAccountModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={async () => {
            const tokenRes = await fetch("/api/auth/verify-token", {
              method: "GET",
              credentials: "include",
            });

            if (!tokenRes.ok) {
              toast.error("Session expired.");
              return;
            }

            const { userId, token } = await tokenRes.json();

            const res = await fetch("/api/account/delete", {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, token }),
            });

            if (res.ok) {
              // NOTE: DeleteAccountModal handles logic to redirect user to account account-delete page
              toast.success("Account deleted.");
            } else {
              toast.error("Failed to delete account.");
            }

            setShowDeleteModal(false);
          }}
        />
      )}
      <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
    </div>
  );
};

export default ProfilePage;
