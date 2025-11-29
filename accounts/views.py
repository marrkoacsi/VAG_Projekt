from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

from .serializers import RegisterSerializer, EmailVerifySerializer


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Regisztráció sikeres, ellenőrizd az emailedet a kódért."},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Hiányzó adatok."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)

        if user is not None and user.is_active:
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Sikeres belépés",
                    "token": token.key,
                    "username": user.username,
                    "email": user.email,
                }
            )

        return Response(
            {"detail": "Hibás adatok vagy nincs megerősítve az email címed."},
            status=status.HTTP_400_BAD_REQUEST,
        )


class VerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = EmailVerifySerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response(
                {
                    "message": "Email sikeresen megerősítve.",
                    "token": token.key,
                    "username": user.username,
                    "email": user.email,
                }
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
