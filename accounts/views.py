# accounts/views.py
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils.crypto import get_random_string

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer, LoginSerializer, EmailVerifySerializer
from .models import EmailVerification


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # *** FONTOS: JSON-hoz mindig request.data !!! ***
        serializer = RegisterSerializer(data=request.data)

        if not serializer.is_valid():
            # Itt fogod látni, ha valami mező hiányzik / rossz
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        # Létrehozzuk a usert (inaktív lesz, amíg nem erősíti meg az emailt)
        user = serializer.save()
        user.is_active = False
        user.save()

        # 6 jegyű kód
        code = get_random_string(length=6, allowed_chars="0123456789")

        # EmailVerification objektum (feltételezve, hogy ilyen a modelled)
        EmailVerification.objects.create(user=user, code=code, is_verified=False)

        # Email kiküldése (Renderen Gmail app-passworddal)
        send_mail(
            subject="VAG Fórum – regisztráció megerősítése",
            message=f"A regisztrációs kódod: {code}",
            from_email=None,  # DEFAULT_FROM_EMAIL-ből jön
            recipient_list=[user.email],
            fail_silently=True,
        )

        return Response(
            {"message": "Regisztráció sikeres, ellenőrizd az emailedet a kód miatt."},
            status=status.HTTP_201_CREATED,
        )


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
