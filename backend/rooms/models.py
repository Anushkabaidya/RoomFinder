from django.db import models

class Room(models.Model):
    title = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    price = models.IntegerField()
    type = models.CharField(max_length=50) # 1 BHK, Studio, etc.
    preference = models.CharField(max_length=50) # Bachelor, Family, etc.
    contact = models.CharField(max_length=50)
    owner_id = models.CharField(max_length=100, default='') # Supabase User ID
    image = models.URLField(max_length=500, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
