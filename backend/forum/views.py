from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action

from .models import Category, Topic, Post
from .serializers import CategorySerializer, TopicSerializer, PostSerializer


class IsAuthenticatedOrReadOnly(permissions.BasePermission):
    """
    Olvasni bárki tud, írni csak bejelentkezett felhasználó.
    """

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Csak list + retrieve, kategóriák listázására.
    """
    queryset = Category.objects.all().order_by("name")
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class TopicViewSet(viewsets.ModelViewSet):
    """
    Témák listázása / létrehozása.
    GET /api/forum/topics/?category=<category_id>
    """
    serializer_class = TopicSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Topic.objects.select_related("category", "creator").all()
        category_id = self.request.query_params.get("category")
        if category_id:
            qs = qs.filter(category_id=category_id)
        return qs


class PostViewSet(viewsets.ModelViewSet):
    """
    Posztok listázása / létrehozása.
    GET /api/forum/posts/?topic=<topic_id>
    """
    serializer_class = PostSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        qs = Post.objects.select_related("topic", "author", "topic__category")
        topic_id = self.request.query_params.get("topic")
        if topic_id:
            qs = qs.filter(topic_id=topic_id)
        return qs
