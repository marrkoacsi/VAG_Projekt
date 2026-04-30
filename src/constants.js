// API Configuration
export const API_BASE_URL = "https://backend-bk14.onrender.com";

// Routes
export const ROUTES = {
  HOME: "/",
  FORUM: "/forum",
  FORUM_VW: "/forum/vw",
  FORUM_SKODA: "/forum/skoda",
  FORUM_SEAT: "/forum/seat",
  AUTH: "/auth",
  REGISTER: "/reg",
  PREMIUM: "/premium",
  CODE: "/code",
};

// Brand Information
export const BRANDS = [
  {
    id: "vw",
    name: "VolksWagen",
    logo: "/images/vw-logo.png",
    link: ROUTES.FORUM_VW,
  },
  {
    id: "skoda",
    name: "Skoda",
    logo: "/images/skoda-logo.png",
    link: ROUTES.FORUM_SKODA,
  },
  {
    id: "seat",
    name: "Seat",
    logo: "/images/seat-logo.png",
    link: ROUTES.FORUM_SEAT,
  },
];

// UI Messages
export const MESSAGES = {
  LOADING: "Betöltés...",
  ERROR: "Hiba történt. Kérjük próbálja újra.",
  SUCCESS: "Sikeres művelet!",
  INVALID_EMAIL: "Érvénytelen email cím",
  PASSWORD_MISMATCH: "A jelszavak nem egyeznek",
  REQUIRED_FIELD: "Ez a mező kötelező",
};
