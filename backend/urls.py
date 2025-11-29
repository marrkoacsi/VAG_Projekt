from django.contrib import admin
from django.urls import path
from accounts.views import RegisterView, LoginView, VerifyEmailView

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/verify-email/", VerifyEmailView.as_view(), name="verify-email"),
]
