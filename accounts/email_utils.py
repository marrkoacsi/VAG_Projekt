# accounts/email_utils.py
import os
import requests

RESEND_API_KEY = os.environ.get("RESEND_API_KEY")
RESEND_FROM_EMAIL = os.environ.get(
    "RESEND_FROM_EMAIL",
    "noreply@vagforum.store",  # ezt állítottuk Render env-ben is
)


def send_verification_email(to_email: str, code: str) -> bool:
    """
    True, ha sikerült elküldeni az emailt Resend-del, különben False.
    FEJLESZTÉSNÉL LOGOLUNK, HOGY LÁSSUK A RESEND VÁLASZT.
    """
    if not RESEND_API_KEY:
        print("[EMAIL] RESEND_API_KEY hiányzik, nem küldök emailt.")
        return False

    url = "https://api.resend.com/emails"

    payload = {
        "from": f"VAG Fórum <{RESEND_FROM_EMAIL}>",
        "to": [to_email],
        "subject": "VAG Fórum – regisztráció megerősítése",
        "text": f"A regisztrációs kódod: {code}",
    }

    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=10)
        # IDE ÍRJUK KI A TELJES RESEND VÁLASZT
        print("[EMAIL] Resend válasz:", resp.status_code, resp.text)

        resp.raise_for_status()
        return True
    except Exception as e:
        print("[EMAIL] Hiba a Resend hívás közben:", e)
        return False
