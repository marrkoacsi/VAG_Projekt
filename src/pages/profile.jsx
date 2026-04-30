import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../utils/api";
import { Loading } from "../components/common/Loading";
import ProfileCard from "../components/user/ProfileCard";
import ProfileEditForm from "../components/user/ProfileEditForm";
import UserPostsList from "../components/user/UserPostsList";
import { useProfile } from "../hooks/user/useProfile";
import "../styles/profile.css";
import "../styles/forum.css";
const DEFAULT_AVATAR = "https://via.placeholder.com/150";

export default function Profile() {
  const navigate = useNavigate();
  const { username: profileUsernameParam } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [myPosts, setMyPosts] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    car_model: "",
  });

  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const userId = user?.id;
  const profileUsername = profileUsernameParam
    ? decodeURIComponent(profileUsernameParam)
    : "";
  const isOwnProfile = !profileUsername || profileUsername === user?.username;

  const { profileUser, setProfileUser, loading, error, loadProfile } = useProfile(userId, profileUsername);

  // Debug logging
  useEffect(() => {
    console.log("Profile debug - userId:", userId, "profileUsername:", profileUsername);
    console.log("Profile debug - profileUser:", profileUser);
    console.log("Profile debug - loading:", loading, "error:", error);
  }, [userId, profileUsername, profileUser, loading, error]);

  useEffect(() => {
    if (!profileUsername && !userId) {
      navigate("/auth");
      return;
    }
  }, [userId, profileUsername, navigate]);

  // Load user posts when profile is loaded
  useEffect(() => {
    if (profileUser) {
      loadUserPosts();
    }
  }, [profileUser]);

  async function loadUserPosts() {
    try {
      const postsData = await api.getProfilePosts({
        profileUserId: profileUser.id,
        userId: userId,
        limit: 20,
        offset: 0
      });

      if (postsData?.ok && postsData?.posts) {
        setMyPosts(postsData.posts);
      } else {
        setMyPosts([]);
      }
    } catch (postsError) {
      console.error("Posts loading error:", postsError);
      setMyPosts([]);
    }
  }

  function getPremiumLabel(type) {
    switch (Number(type)) {
      case 1:
        return "Pro";
      case 2:
        return "Lifetime";
      default:
        return "Ingyenes";
    }
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !userId || !profileUser) return;

    try {
      setUploading(true);

      const result = await api.uploadProfilePicture(userId, profileUser.username || "user", file);

      if (result?.ok) {
        setStatusMessage(result.message || "Profilkép sikeresen frissítve.");
        setProfileUser((prev) => ({
          ...prev,
          ppicture: result.url || prev?.ppicture,
        }));

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...parsedUser,
              ppicture: result.url || parsedUser.ppicture,
            })
          );
        }
      } else {
        setStatusMessage(result?.message || result?.error || "Hiba történt a feltöltés során.");
      }
    } catch (err) {
      setStatusMessage("Hiba történt a profilkép feltöltése során.");
    } finally {
      setUploading(false);
      e.target.value = "";
      window.setTimeout(() => setStatusMessage(""), 3000);
    }
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleProfileSave(editFormData) {
    if (!userId || !profileUser) return;

    try {
      setSaving(true);
      setStatusMessage("");

      const payload = {
        first_name: editFormData.first_name.trim(),
        last_name: editFormData.last_name.trim(),
        car_model: editFormData.car_model.trim(),
      };

      console.log("Saving with payload:", payload);
      const result = await api.updateProfile(payload);
      if (!result?.ok) {
        setStatusMessage(result?.message || result?.error || "Sikertelen mentés.");
        return;
      }

      console.log("Updating profile user data:", payload);
      setProfileUser((prev) => {
        console.log("Previous profile user:", prev);
        const updated = {
          ...prev,
          first_name: editFormData.first_name.trim(),
          last_name: editFormData.last_name.trim(),
          car_model: editFormData.car_model.trim(),
        };
        console.log("Updated profile user:", updated);
        return updated;
      });
      setIsEditing(false);

      setStatusMessage(result?.message || "Profil adatok sikeresen mentve.");
    } catch (error) {
      setStatusMessage("Hiba történt mentés közben.");
    } finally {
      setSaving(false);
      window.setTimeout(() => setStatusMessage(""), 3000);
    }
  }

  function startEditing() {
    if (!profileUser) return;
    setFormData({
      first_name: profileUser.first_name || "",
      last_name: profileUser.last_name || "",
      car_model: profileUser.car_model || "",
    });
    setIsEditing(true);
  }

  function cancelEditing() {
    if (!profileUser) return;
    setFormData({
      first_name: profileUser.first_name || "",
      last_name: profileUser.last_name || "",
      car_model: profileUser.car_model || "",
    });
    setIsEditing(false);
  }

  if (loading) {
    return <Loading />;
  }

  if (!profileUser) {
    return (
      <div className="profile-state-message">
        {error ? `Hiba: ${error}` : "Hiba az adatok lekérésekor."}
        {userId && (
          <button 
            onClick={loadProfile} 
            style={{ marginLeft: '10px', padding: '5px 10px' }}
          >
            Újra próbálkozás
          </button>
        )}
      </div>
    );
  }

  const imageSource = profileUser?.ppicture || DEFAULT_AVATAR;

  return (
    <div className="profile-page">
      <section className="profile-hero-card">
        <div
          className="profile-avatar-wrapper"
          onClick={() =>
            isOwnProfile &&
            !saving &&
            document.getElementById("fileInput")?.click()
          }
        >
          <img
            src={imageSource}
            className="profile-avatar"
            alt="Profilkép"
            onError={(e) => {
              e.currentTarget.src = DEFAULT_AVATAR;
            }}
          />
          <div className="profile-avatar-badge">{saving ? "..." : "+"}</div>
        </div>
        <input
          type="file"
          id="fileInput"
          hidden
          accept="image/*"
          onChange={handleFileUpload}
        />

        <div className="profile-main-info">
          <h1>{profileUser.username || "Felhasználó"}</h1>
          <p className="profile-main-info-email">
            {isOwnProfile ? profileUser.email || "Nincs email" : "Publikus profil"}
          </p>
          <p className="profile-premium-chip">
            Csomag: <strong>{getPremiumLabel(profileUser.premium_type)}</strong>
          </p>
          {statusMessage && <p className="profile-status-message">{statusMessage}</p>}
        </div>
      </section>

      <section className="profile-grid">
        <div className="profile-card">
          <h3>Személyes adatok</h3>
          {isOwnProfile && isEditing ? (
            <ProfileEditForm
              user={profileUser}
              onSave={handleProfileSave}
              onCancel={cancelEditing}
              saving={saving}
            />
          ) : (
            <ProfileCard
              user={profileUser}
              isOwnProfile={isOwnProfile}
              onEditClick={startEditing}
            />
          )}
        </div>

        <div className="profile-card">
          <UserPostsList posts={myPosts} loading={false} error={null} />
        </div>
      </section>

      {isOwnProfile ? (
        <section className="profile-card profile-quick-actions">
          <h3>Gyors műveletek</h3>
          <div className="profile-quick-actions-grid">
            <button onClick={() => navigate("/code")} className="profile-btn profile-btn--primary">
              Jelszó módosítása
            </button>
            <button
              onClick={isEditing ? cancelEditing : startEditing}
              className="profile-btn profile-btn--primary"
            >
              {isEditing ? "Szerkesztés bezárása" : "Profil szerkesztése"}
            </button>
            <button onClick={() => navigate("/tuning")} className="profile-btn profile-btn--ghost">
              Tuning oldal
            </button>
            <button
              onClick={() => navigate("/premium")}
              className="profile-btn profile-btn--ghost"
            >
              Csomagok megtekintése
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
