from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = "Kategória"
        verbose_name_plural = "Kategóriák"

    def __str__(self):
        return self.name


class Topic(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="topics",
    )
    title = models.CharField(max_length=200)
    creator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="topics",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_locked = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Téma"
        verbose_name_plural = "Témák"
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class Post(models.Model):
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_edited = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Hozzászólás"
        verbose_name_plural = "Hozzászólások"
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.author} – {self.topic} – {self.created_at:%Y-%m-%d %H:%M}"
