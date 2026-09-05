from datetime import datetime, timedelta, time
from django.utils import timezone
from apps.providers.models import ProviderProfile, AvailabilitySlot, AvailabilityBlock
from apps.bookings.models import Booking

def generate_available_slots(provider_id: int, start_date=None, days_count=7, slot_duration_minutes=60):
    """
    Computes real-time available booking slots for a provider.
    Cross-checks recurring weekly slots, date blocks, and active bookings.
    """
    if start_date is None:
        start_date = timezone.now().date()
    elif isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()

    try:
        provider = ProviderProfile.objects.get(id=provider_id, is_active=True)
    except ProviderProfile.DoesNotExist:
        return []

    end_date = start_date + timedelta(days=days_count)

    # 1. Fetch recurring availability
    weekly_slots = provider.availability_slots.filter(is_active=True)
    slots_by_day = {}
    for slot in weekly_slots:
        slots_by_day.setdefault(slot.day_of_week, []).append((slot.start_time, slot.end_time))

    # Fallback: if provider has no custom slots, default to Monday-Friday 09:00 - 17:00
    if not weekly_slots.exists():
        for d in range(5):  # Mon-Fri
            slots_by_day[d] = [(time(9, 0), time(17, 0))]

    # 2. Fetch date blocks
    date_blocks = provider.availability_blocks.filter(date__gte=start_date, date__lte=end_date)
    all_day_blocked_dates = set(date_blocks.filter(all_day=True).values_list('date', flat=True))
    hourly_blocks = date_blocks.filter(all_day=False)

    # 3. Fetch existing conflicting bookings
    existing_bookings = Booking.objects.filter(
        provider=provider,
        status__in=['PENDING', 'CONFIRMED'],
        start_time__date__gte=start_date,
        start_time__date__lte=end_date
    ).values('start_time', 'end_time')

    result_by_date = {}

    for day_offset in range(days_count):
        current_date = start_date + timedelta(days=day_offset)
        date_str = current_date.strftime("%Y-%m-%d")
        result_by_date[date_str] = []

        if current_date in all_day_blocked_dates:
            continue

        weekday = current_date.weekday()  # 0=Monday, 6=Sunday
        day_windows = slots_by_day.get(weekday, [])

        for win_start, win_end in day_windows:
            curr_slot_start = datetime.combine(current_date, win_start)
            window_end_dt = datetime.combine(current_date, win_end)

            while curr_slot_start + timedelta(minutes=slot_duration_minutes) <= window_end_dt:
                slot_end = curr_slot_start + timedelta(minutes=slot_duration_minutes)

                # Timezone aware comparison
                aware_start = timezone.make_aware(curr_slot_start) if timezone.is_naive(curr_slot_start) else curr_slot_start
                aware_end = timezone.make_aware(slot_end) if timezone.is_naive(slot_end) else slot_end

                # Skip past times
                if aware_start <= timezone.now():
                    curr_slot_start += timedelta(minutes=slot_duration_minutes)
                    continue

                # Check conflict with existing bookings
                has_collision = False
                for b in existing_bookings:
                    b_start = b['start_time']
                    b_end = b['end_time']
                    if not (aware_end <= b_start or aware_start >= b_end):
                        has_collision = True
                        break

                # Check conflict with hourly blocks
                if not has_collision:
                    for block in hourly_blocks.filter(date=current_date):
                        if block.start_time and block.end_time:
                            block_start = timezone.make_aware(datetime.combine(current_date, block.start_time))
                            block_end = timezone.make_aware(datetime.combine(current_date, block.end_time))
                            if not (aware_end <= block_start or aware_start >= block_end):
                                has_collision = True
                                break

                if not has_collision:
                    result_by_date[date_str].append({
                        "start_time": aware_start.isoformat(),
                        "end_time": aware_end.isoformat(),
                        "display_time": curr_slot_start.strftime("%I:%M %p"),
                        "available": True
                    })

                curr_slot_start += timedelta(minutes=slot_duration_minutes)

    return result_by_date
