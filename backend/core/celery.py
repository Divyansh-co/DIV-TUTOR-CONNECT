import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings.dev')

app = Celery('tutorconnect')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

app.conf.beat_schedule = {
    'send-24h-booking-reminders': {
        'task': 'apps.core.tasks.send_upcoming_booking_reminders',
        'schedule': crontab(minute='0'),  # Run every hour
    },
    'send-post-session-review-nudges': {
        'task': 'apps.core.tasks.send_review_nudges',
        'schedule': crontab(minute='30'),  # Run every hour at minute 30
    },
    'send-weekly-provider-digest': {
        'task': 'apps.core.tasks.send_weekly_digest',
        'schedule': crontab(hour='8', minute='0', day_of_week='monday'),
    },
}
