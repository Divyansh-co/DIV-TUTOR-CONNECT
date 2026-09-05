from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg, Count
from .models import Review

def update_provider_rating_rollup(provider):
    """Recalculate and update the average rating and review count for a provider."""
    stats = provider.reviews.aggregate(
        avg_rating=Avg('rating'),
        count=Count('id')
    )
    avg = stats['avg_rating'] or 5.0
    count = stats['count'] or 0
    provider.rating_avg = round(avg, 2)
    provider.reviews_count = count
    provider.save(update_fields=['rating_avg', 'reviews_count'])

@receiver(post_save, sender=Review)
def handle_review_saved(sender, instance, created, **kwargs):
    update_provider_rating_rollup(instance.provider)

@receiver(post_delete, sender=Review)
def handle_review_deleted(sender, instance, **kwargs):
    update_provider_rating_rollup(instance.provider)
