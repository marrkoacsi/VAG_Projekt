from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.utils.crypto import get_random_string

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer, LoginSerializer, EmailVerifySerializer
from .models import EmailVerification
from .email_utils import send_verification_email

import logging

logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # user létrehozása, inaktívként
        user = serializer.save()
        user.is_active = False
        user.save()

        # 6 számjegyű kód
        code = get_random_string(length=6, allowed_chars="0123456789")

        EmailVerification.objects.create(
            user=user,
            code=code,
            is_verified=False,
        )

        # Email küldés Resend-del
        email_ok = send_verification_email(user.email, code)

        # VÁLASZ – ha nem ment ki az email, FEJLESZTÉSNÉL visszaadjuk a kódot is
        response_data = {
            "message": "Regisztráció sikeres, ellenőrizd az emailedet a kód miatt.",
        }

        if not email_ok:
            # Ezt PROD-ban majd érdemes kiszedni, de most debugra tökéletes
            response_data["email_info"] = (
                "Nem sikerült elküldeni a verifikációs emailt. "
                "Fejlesztés alatt a kódot itt is megkapod."
            )
            response_data["debug_code"] = code

        return Response(response_data, status=status.HTTP_201_CREATED)



class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            username=serializer.validated_data["username"],
            password=serializer.validated_data["password"],
        )

        if user is None:
            return Response(
                {"detail": "Hibás felhasználónév vagy jelszó."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not user.is_active:
            return Response(
                {"detail": "Kérlek erősítsd meg az emailedet a belépés előtt."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key})


class VerifyEmailView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        code = serializer.validated_data["code"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "Nincs ilyen email cím."}, status=400)

        try:
            ev = EmailVerification.objects.get(
                user=user,
                code=code,
                is_verified=False,
            )
        except EmailVerification.DoesNotExist:
            return Response({"detail": "Hibás vagy már felhasznált kód."}, status=400)

        user.is_active = True
        user.save()
        ev.is_verified = True
        ev.save()

        return Response({"message": "Email sikeresen megerősítve."})
