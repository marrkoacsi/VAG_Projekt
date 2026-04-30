import { useAuth } from "../context/AuthContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

class APIService {
  // SEGÉDFÜGGVÉNY: Kinyeri az ID-t a képeden látható "user" objektumból
  getStoredUserId() {
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    try {
      const parsed = JSON.parse(userData);
      return parsed.id; // A képeden látható "id": 34 mező kinyerése
    } catch (e) {
      console.error("Hiba a localStorage user adatainak olvasásakor:", e);
      return null;
    }
  }

  async handleResponse(response) {
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Invalid JSON response:", text.substring(0, 200));
      throw new Error("Invalid JSON response from server");
    }
  }

  // --- AUTH ÉS REGISZTRÁCIÓ ---

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/reg.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  }

  async googleLogin(token) {
    try {
      const response = await fetch(`${API_BASE_URL}/google_login.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Google login error:", error);
      throw error;
    }
  }

  // --- FÓRUM ÉS POSZTOK ---

  async getForumPosts(filters = {}) {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "" && v !== undefined)
      );

      const queryParams = new URLSearchParams({
        action: "get",
        ...cleanFilters
      }).toString();

      const response = await fetch(`${API_BASE_URL}/forum.php?${queryParams}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error("Forum posts fetch error:", error);
      throw error;
    }
  }

  async updateReaction(postId, type) {
    try {
      const userId = this.getStoredUserId(); // Itt már a jó ID-t kapja meg
      const response = await fetch(`${API_BASE_URL}/forum.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: postId, 
          action: type,
          userId: userId
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Reaction update error:", error);
      throw error;
    }
  }

  async createPost(formData) {
    try {
      // Ha FormData-t küldesz (fájlfeltöltés), NEM szabad Content-Type-ot megadni!
      const response = await fetch(`${API_BASE_URL}/post.php`, {
        method: "POST",
        body: formData, 
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Create post error:", error);
      throw error;
    }
  }

  async getPostDetail(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/post_detail.php?postId=${postId}`);
      return this.handleResponse(response);
    } catch (error) {
      console.error("Post detail fetch error:", error);
      throw error;
    }
  }

  async createReply(postId, content) {
    try {
      const userId = this.getStoredUserId();
      const response = await fetch(`${API_BASE_URL}/post_detail.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: postId,
          userId: userId,
          content: content
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Create reply error:", error);
      throw error;
    }
  }

  // --- PROFIL KEZELÉS ---

  async getProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get", userId: userId }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Get profile error:", error);
      throw error;
    }
  }

  async getProfileByUsername(username) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "get_by_username", username: username }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Get profile by username error:", error);
      throw error;
    }
  }

  async getProfilePosts({ profileUserId, userId, limit = 20, offset = 0 }) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get_posts",
          profileUserId: profileUserId,
          userId: userId,
          limit: limit,
          offset: offset
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Get profile posts error:", error);
      throw error;
    }
  }

  async updateProfile(data) {
    try {
      const userId = this.getStoredUserId();
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          userId: userId,
          first_name: data.first_name,
          last_name: data.last_name,
          car_model: data.car_model
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    }
  }

  async uploadProfilePicture(userId, username, file) {
    try {
      const formData = new FormData();
      formData.append("ppicture", file);
      formData.append("userId", userId);
      formData.append("username", username);

      const response = await fetch(`${API_BASE_URL}/profile_picture.php`, {
        method: "POST",
        body: formData,
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Upload profile picture error:", error);
      throw error;
    }
  }

  async updatePremium(userId, plan) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_premium",
          userId: userId,
          plan: plan
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Update premium error:", error);
      throw error;
    }
  }

  // --- BIZTONSÁG ÉS FIÓK ---

  async requestEmailChange(userId, newEmail) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile_security.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_email_change",
          userId,
          new_email: newEmail,
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Email change request error:", error);
      throw error;
    }
  }

  async confirmDeleteAccount(userId, code, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/profile_delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "confirm_delete",
          userId,
          code,
          password,
        }),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error("Delete account error:", error);
      throw error;
    }
  }
}

export const api = new APIService();