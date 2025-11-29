# accounts/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers

from .models import EmailVerification


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    gender = serializers.CharField(required=True)
    birth_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "gender", "birth_date"]

    def create(self, validated_data):
        """
        A sima User modellben nincs gender és birth_date mező,
        ezeket most csak "extra" adatként nem mentjük,
        ha akarsz majd külön profil modellbe tehetjük.
        """
        username = validated_data["username"]
        email = validated_data["email"]
        password = validated_data["password"]

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    """
    A bejelentkezéshez használt serializer.
    """
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class EmailVerifySerializer(serializers.Serializer):
    """
    Az email-es hitelesítő kód ellenőrzéséhez.
    """
    email = serializers.EmailField()
    token = serializers.CharField()
