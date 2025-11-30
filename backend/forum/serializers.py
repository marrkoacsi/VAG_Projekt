from rest_framework import serializers
from .models import Category, Topic, Post


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "description"]


class TopicSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        source="category", queryset=Category.objects.all(), write_only=True
    )
    creator_username = serializers.CharField(source="creator.username", read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "title",
            "category",
            "category_id",
            "creator",
            "creator_username",
            "created_at",
            "updated_at",
            "is_locked",
        ]
        read_only_fields = ["creator", "created_at", "updated_at", "is_locked"]

    def create(self, validated_data):
        # a view-ben majd beállítjuk request.user-t creator-nak
        validated_data["creator"] = self.context["request"].user
        return super().create(validated_data)


class PostSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source="author.username", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "topic",
            "author",
            "author_username",
            "content",
            "created_at",
            "updated_at",
            "is_edited",
        ]
        read_only_fields = ["author", "created_at", "updated_at", "is_edited"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)
