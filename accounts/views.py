
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer, LoginSerializer, EmailVerifySerializer
from .models import EmailVerification

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # JSON, form-data, bármi -> request.data
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()
            # itt mehet a hitelesítő kód generálás + email küldés
            return Response(
                {"message": "Regisztráció sikeres, ellenőrizd az emailedet a kód miatt."},
                status=status.HTTP_201_CREATED,
            )

        # ha valami nem oké, hibaüzeneteket ad vissza (pl. foglalt felhasználónév)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # itt is request.data legyen
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)
        if user is None:
            return Response(
                {"detail": "Hibás felhasználónév vagy jelszó."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {
                "message": "Sikeres bejelentkezés",
                "token": token.key,
                "username": user.username,
                "email": user.email,
            }
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # ha itt is POST-ot használsz, akkor itt is request.data
        serializer = EmailVerifySerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        code = serializer.validated_data["code"]

        try:
            verification = EmailVerification.objects.get(token=code, is_used=False)
        except EmailVerification.DoesNotExist:
            return Response(
                {"detail": "Érvénytelen vagy már felhasznált kód."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification.is_used = True
        verification.save()

        user = verification.user
        user.is_active = True
        user.save()

        return Response({"message": "Email sikeresen megerősítve."})
