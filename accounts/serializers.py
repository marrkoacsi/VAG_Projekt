# accounts/serializers.py
from django.contrib.auth.models import User
from rest_framework import serializers


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    gender = serializers.ChoiceField(
        choices=["male", "female", "other"],
        required=False,
        allow_null=True,
        allow_blank=False,
    )
    birth_date = serializers.DateField(required=False, allow_null=True)

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Ez a felhasználónév már foglalt.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Ezzel az email címmel már regisztráltak.")
        return value

    def create(self, validated_data):
        """
        Itt ténylegesen létrehozzuk a felhasználót.
        A gender és birth_date most NINCS eltárolva sehova – ha lesz UserProfile modelled,
        oda majd beírhatjuk.
        """
        password = validated_data.pop("password")
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=password,
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)



class EmailVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)
