from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core import exceptions
from django.core.mail import send_mail
from rest_framework import serializers
import re
import random

from .models import EmailVerification, UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    email = serializers.EmailField(required=True)
    gender = serializers.ChoiceField(
        choices=UserProfile.GENDER_CHOICES, required=False, allow_blank=True
    )
    birth_date = serializers.DateField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "gender", "birth_date")

    def validate_password(self, value):
        # Django saját validátorai
        try:
            validate_password(value)
        except exceptions.ValidationError as e:
            raise serializers.ValidationError(e.messages)

        # Saját szabályaink
        errors = []
        if len(value) < 8:
            errors.append("A jelszónak legalább 8 karakteresnek kell lennie.")
        if not re.search(r"[A-Z]", value):
            errors.append("Legalább egy nagybetűt tartalmaznia kell.")
        if not re.search(r"[0-9]", value):
            errors.append("Legalább egy számot tartalmaznia kell.")
        if not re.search(r"[!@#$%^&*()_\-+=\[{\]}\\|;:'\",.<>/?]", value):
            errors.append("Legalább egy speciális karaktert tartalmaznia kell.")

        if errors:
            raise serializers.ValidationError(errors)

        return value

    def create(self, validated_data):
        gender = validated_data.pop("gender", "")
        birth_date = validated_data.pop("birth_date", None)

        username = validated_data.get("username")
        email = validated_data.get("email")
        password = validated_data.get("password")

        # User létrehozása inaktívként
        user = User(
            username=username,
            email=email,
            is_active=False,
        )
        user.set_password(password)
        user.save()

        # Profil (nem + születési idő)
        UserProfile.objects.create(
            user=user,
            gender=gender,
            birth_date=birth_date,
        )

        # 6 jegyű kód
        code = f"{random.randint(100000, 999999)}"

        EmailVerification.objects.update_or_create(
            user=user,
            defaults={"code": code, "is_verified": False},
        )

        # Email küldés (konzol/backend vagy SMTP – attól függ mit állítottál)
        send_mail(
            subject="VAG Fórum - Email megerősítés",
            message=f"Szia {username}! A megerősítő kódod: {code}",
            from_email=None,
            recipient_list=[email],
            fail_silently=True,
        )

        return user


class EmailVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6)

    def validate(self, attrs):
        email = attrs.get("email")
        code = attrs.get("code")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "Nincs ilyen email címmel felhasználó."}
            )

        try:
            ev = user.email_verification
        except EmailVerification.DoesNotExist:
            raise serializers.ValidationError(
                {"email": "Ehhez a felhasználóhoz nincs megerősítő kód."}
            )

        if ev.is_verified:
            raise serializers.ValidationError(
                {"email": "Ez az email cím már meg van erősítve."}
            )

        if ev.is_expired():
            raise serializers.ValidationError(
                {"code": "A kód lejárt, regisztrálj újra."}
            )

        if ev.code != code:
            raise serializers.ValidationError({"code": "Hibás kód."})

        attrs["user"] = user
        attrs["verification"] = ev
        return attrs

    def save(self, **kwargs):
        user = self.validated_data["user"]
        ev = self.validated_data["verification"]

        user.is_active = True
        user.save()

        ev.is_verified = True
        ev.save()

        return user
