from rest_framework import serializers
from .models import Room

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ['id', 'title', 'location', 'price', 'type', 'preference', 'contact', 'image', 'owner_id', 'created_at']
