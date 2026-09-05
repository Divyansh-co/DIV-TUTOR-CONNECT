from rest_framework import permissions

class IsProvider(permissions.BasePermission):
    """Allows access only to users marked as a provider."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_provider)

class IsProviderOwnerOrReadOnly(permissions.BasePermission):
    """
    Object-level permission allowing only the owner provider to edit their profile or listings.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        # If obj is a ProviderProfile
        if hasattr(obj, 'user'):
            return obj.user == request.user
        # If obj is a ServiceListing or AvailabilitySlot
        if hasattr(obj, 'provider'):
            return obj.provider.user == request.user
        return False
