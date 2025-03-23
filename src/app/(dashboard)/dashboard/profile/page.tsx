// Updates required for integration with database:
// - API calls to facilitate PATCH/PUT for account details
// - Where does the change/cancel subscription link go to?

"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button/Button";
import { toast } from "react-hot-toast";
import styles from "./page.module.scss";

const ProfilePage: React.FC = () => {
  const [email, setEmail] = useState<string>("user@example.com");
  const [age, setAge] = useState<number | undefined>();
  const [location, setLocation] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [fitnessLevel, setFitnessLevel] = useState<string>("");

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempAge, setTempAge] = useState<number | undefined>(age);
  const [tempLocation, setTempLocation] = useState<string>(location);
  const [tempGender, setTempGender] = useState<string>(gender);
  const [tempFitnessLevel, setTempFitnessLevel] =
    useState<string>(fitnessLevel);

  const [isLoading, setIsLoading] = useState<boolean>(false);
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
        setEmail(data.email || "");
        setAge(data.age ?? undefined);
        setLocation(data.location || "");
        setGender(data.gender || "");
        setFitnessLevel(data.fitness_level || "");
      } catch (error) {
        console.error("Failed to load profile:", error);
        setIsLoggedIn(false);
      }
    }

    fetchProfile();
  }, []);

  const handleEditClick = (): void => {
    setIsEditing(true);
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

    if (tempAge && (tempAge < 0 || tempAge > 120)) {
      toast.error("Please enter a valid age between 0 and 120.");
      setIsLoading(false);
      return;
    }

    if (tempLocation.length > 100) {
      toast.error("Location must be under 100 characters.");
      setIsLoading(false);
      return;
    }

    if (tempGender && !["male", "female", "other"].includes(tempGender)) {
      toast.error("Please select a valid gender.");
      setIsLoading(false);
      return;
    }

    if (
      tempFitnessLevel &&
      !["beginner", "intermediate", "advanced"].includes(tempFitnessLevel)
    ) {
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
          age: tempAge,
          location: tempLocation.trim(),
          gender: tempGender,
          fitnessLevel: tempFitnessLevel,
        }),
      });

      if (!updateRes.ok) {
        toast.error("Error updating profile. Please try again.");
        setIsLoading(false);
        return;
      }

      setAge(tempAge);
      setLocation(tempLocation.trim());
      setGender(tempGender);
      setFitnessLevel(tempFitnessLevel);
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

      {!isEditing && (
        <div className={styles.profile__info}>
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
            <span className={styles.profile__value}>{location || "N/A"}</span>
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
        </div>
      )}

      {isEditing && (
        <form className={styles.profile__form} onSubmit={handleSaveProfile}>
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
            <Button type="submit" variant="tertiary">
              {isLoading ? "Updating..." : "Save Profile"}
            </Button>
          </div>
        </form>
      )}

      <div className={styles.profile__actions}>
        <div className={styles.profile__links}>
          <Link
            href="/auth/forgot-password"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profile__link}
          >
            Change Password
          </Link>
          <Link
            href="mailto:michaelolajidejr@gmail.com"
            className={styles.profile__link}
          >
            Request Email Update
          </Link>
          <Link
            href="/dashboard/cancel-subscription"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profile__link}
          >
            Cancel Subscription
          </Link>
          <Link
            href="/contact"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.profile__link}
          >
            FAQ
          </Link>
        </div>

        {isLoggedIn && (
          <Button
            variant="tertiary"
            className={styles.profile__logoutButton}
            onClick={handleLogout}
          >
            Log Out
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
