import requests
from django.conf import settings


def send_verification_email(to_email: str, code: str) -> None:
    """
    Verifikációs email küldése Resend API-val.
    Ha nincs RESEND_API_KEY, csak kiírjuk a kódot logba, hogy ne dőljön össze az app.
    """
    api_key = getattr(settings, "RESEND_API_KEY", "")
    from_email = getattr(
        settings,
        "RESEND_FROM_EMAIL",
        "VAG Fórum <onboarding@resend.dev>",
    )

    # Ha nincs API key, ne dobjunk hibát – csak logoljuk
    if not api_key:
        print("FIGYELEM: RESEND_API_KEY nincs beállítva, nem küldünk valódi emailt!")
        print(f"Verification code for {to_email}: {code}")
        return

    url = "https://api.resend.com/emails"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "from": from_email,
        "to": [to_email],
        "subject": "VAG Fórum – regisztráció megerősítése",
        "text": f"A regisztrációs kódod: {code}",
    }

    # timeout, hogy ne álljon fejre a worker, ha a Resend lassú
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    response.raise_for_status()
