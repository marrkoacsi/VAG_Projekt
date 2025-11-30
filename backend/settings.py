from pathlib import Path
import os

BASE_DIR = Path(__file__).resolve().parent.parent

# ======================================================================
# Alap dolgok
# ======================================================================

SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "dev-secret-ne-hagyd-igy-productionben"
)

DEBUG = os.environ.get("DJANGO_DEBUG", "True") == "True"

ALLOWED_HOSTS = os.environ.get(
    "DJANGO_ALLOWED_HOSTS",
    "localhost,127.0.0.1"
    "vagforum.store",
).split(",")


# ======================================================================
# Appok
# ======================================================================

INSTALLED_APPS = [
    # Django alap appok
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 3rd party
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    # saját app
    "accounts",
]


# ======================================================================
# Middleware
# ======================================================================

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # CORS legyen legelöl
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


ROOT_URLCONF = "backend.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],  # ha nincs templates mappa, akkor is maradhat
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "backend.wsgi.application"


# ======================================================================
# Adatbázis – Render Postgres ENV-ekkel
# ======================================================================

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "vag_forum_db"),
        "USER": os.environ.get("POSTGRES_USER", "postgres"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "admin"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}


# ======================================================================
# Auth / jelszó
# ======================================================================

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ======================================================================
# I18N
# ======================================================================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ======================================================================
# Statikus fájlok
# ======================================================================

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ======================================================================
# CORS / CSRF – frontend + backend Renderen
# ======================================================================

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "https://frontend-igcv.onrender.com",
    "https://vagforum.store",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:5173",
    "https://vag-projekt.onrender.com",
    "https://frontend-igcv.onrender.com",
    "https://vagforum.store",
]

CORS_ALLOW_CREDENTIALS = True


# ======================================================================
# DRF
# ======================================================================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticatedOrReadOnly",
    ],
}


# ======================================================================
# Email – most már NEM SMTP, hanem Resend API-t használunk
# ======================================================================

# Django saját EMAIL_BACKEND-je nem kell, legyen biztonságból console:
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"

# Resend API kulcs + from
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")

RESEND_FROM_EMAIL = os.environ.get(
    "RESEND_FROM_EMAIL",
    "VAG Fórum <onboarding@resend.dev>",  # default, működik domain verifikáció nélkül is
)
