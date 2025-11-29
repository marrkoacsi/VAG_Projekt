from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class EmailVerification(models.Model):
    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="email_verification"
    )
    code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def is_expired(self):
        # 15 percig legyen érvényes
        return self.created_at < timezone.now() - timezone.timedelta(minutes=15)

    def __str__(self):
        return f"EmailVerification({self.user.username}, {self.code})"


class UserProfile(models.Model):
    GENDER_CHOICES = [
        ("male", "Férfi"),
        ("female", "Nő"),
        ("other", "Egyéb / Nem szeretném megadni"),
    ]

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name="profile"
    )
    gender = models.CharField(
        max_length=10, choices=GENDER_CHOICES, blank=True
    )
    birth_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"Profile({self.user.username})"
