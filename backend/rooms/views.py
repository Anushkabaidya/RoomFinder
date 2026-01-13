from rest_framework import generics
from .models import Room
from .serializers import RoomSerializer
from django.db.models import Q
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

@method_decorator(csrf_exempt, name='dispatch')
class RoomListCreateView(generics.ListCreateAPIView):
    serializer_class = RoomSerializer

    def post(self, request, *args, **kwargs):
        role = request.data.get('role')
        if role != 'room_owner':
            from rest_framework.response import Response
            from rest_framework import status
            return Response({"error": "Only room owners can add rooms."}, status=status.HTTP_403_FORBIDDEN)
        return super().post(request, *args, **kwargs)

    def get_queryset(self):
        queryset = Room.objects.all().order_by('-created_at')
        
        # Filter by Location
        location = self.request.query_params.get('location', None)
        if location:
            queryset = queryset.filter(location__icontains=location)
            
        # Filter by Price Range
        min_price = self.request.query_params.get('min_price', None)
        max_price = self.request.query_params.get('max_price', None)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        # Filter by Property Type
        property_type = self.request.query_params.get('type', None)
        if property_type and property_type != 'Any':
             queryset = queryset.filter(type=property_type)

        # Filter by Tenant Preference
        preference = self.request.query_params.get('preference', None)
        if preference and preference != 'Any':
            queryset = queryset.filter(preference=preference)
            
        # Filter by Owner ID (for My Rooms)
        owner_id = self.request.query_params.get('owner_id', None)
        if owner_id:
            queryset = queryset.filter(owner_id=owner_id)
            
        return queryset

@method_decorator(csrf_exempt, name='dispatch')
class RoomDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
