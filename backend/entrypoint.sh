#!/bin/sh
set -e

echo "Waiting for PostgreSQL and applying migrations..."
python manage.py migrate --noinput

echo "Collecting static assets..."
python manage.py collectstatic --noinput --clear || true

echo "Seeding demo marketplace data if needed..."
python manage.py seed_demo_data || true

exec "$@"
