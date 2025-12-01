from django.contrib import admin
from django.urls import path, include

from accounts.views import RegisterView, LoginView, VerifyEmailView
//SZIAAA
from rest_framework.routers import DefaultRouter
from forum.views import CategoryViewSet, TopicViewSet, PostViewSet

router = DefaultRouter()
router.register(r"forum/categories", CategoryViewSet, basename="forum-category")
router.register(r"forum/topics", TopicViewSet, basename="forum-topic")
router.register(r"forum/posts", PostViewSet, basename="forum-post")

urlpatterns = [
    path("admin/", admin.site.urls),

    # Auth endpointok (maradnak, ahogy vannak)
    path("api/auth/register/", RegisterView.as_view(), name="register"),
    path("api/auth/login/", LoginView.as_view(), name="login"),
    path("api/auth/verify-email/", VerifyEmailView.as_view(), name="verify-email"),

    # Fórum API-k
    path("api/", include(router.urls)),
]
