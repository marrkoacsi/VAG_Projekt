import { useState, useEffect } from "react";
import { api } from "../../utils/api";

export function useProfile(userId, profileUsername) {
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = profileUsername
        ? await api.getProfileByUsername(profileUsername)
        : await api.getProfile(userId);
      
      // Extract user data from response
      const profileData = response?.user || response;
      setProfileUser(profileData);
    } catch (err) {
      console.error("Profile loading error:", err);
      setError("Profile loading failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId, profileUsername]);

  return { profileUser, setProfileUser, loading, error, loadProfile };
}
