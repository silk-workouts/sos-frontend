// Updates required for integration with database:
// - API calls to facilitate PATCH/PUT for account details
// - Where does the change/cancel subscription link go to?

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";
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
      toast.error("Please enter a valid age between 0 and 120.");
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.profile}>
      <div className={styles.profile__header}>
        <h1 className={styles.profile__title}>Profile</h1>
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
            <div>Loading ..</div>
          ) : (
            <>
              <div
                className={`${styles.profile__infoGroup} ${styles.profile__name}`}
              >
                <h2 className={styles.profile__subheading}>Welcome Back!</h2>
                <span className={styles.profile__label}>Name</span>
                <p>{name || "silk system user"}</p>
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
                <span className={styles.profile__value}>{gender || "N/A"}</span>
              </div>
              <div className={styles.profile__infoGroup}>
                <span className={styles.profile__label}>Fitness Level</span>
                <span className={styles.profile__value}>
                  {fitnessLevel || "N/A"}
                </span>
              </div>
            </>
          )}
        </section>
      )}

      {isEditing && (
        <div className={styles.profile__editFormWrap}>
          <form className={styles.profile__form} onSubmit={handleSaveProfile}>
            <div className={styles.profile__inputGroup}>
              <label className={styles.profile__label}>Name</label>
              <input
                type="text"
                className={styles.profile__input}
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
              />
            </div>

            <div className={styles.profile__inputGroup}>
              <label className={styles.profile__label}>Age</label>
              <input
                type="number"
                min={0}
                className={styles.profile__input}
                value={tempAge ?? ""}
                onChange={(e) =>
                  setTempAge(parseInt(e.target.value, 10) || undefined)
                }
              />
            </div>

            <div className={styles.profile__inputGroup}>
              <label className={styles.profile__label}>Location</label>
              <input
                type="text"
                className={styles.profile__input}
                value={tempLocation}
                onChange={(e) => setTempLocation(e.target.value)}
              />
            </div>

            <div className={styles.profile__inputGroup}>
              <label className={styles.profile__label}>Gender</label>
              <select
                className={styles.profile__input}
                value={tempGender}
                onChange={(e) => setTempGender(e.target.value)}
              >
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className={styles.profile__inputGroup}>
              <label className={styles.profile__label}>Fitness Level</label>
              <select
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
              <Button variant="text" onClick={handleCancelClick}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="secondary"
                className={styles.profile__saveProfileButton}
              >
                {isLoading ? "Updating..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {!isEditing && (
        <div className={styles.profile__actions}>
          {isLoggedIn && (
            <Button
              variant="primary"
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
