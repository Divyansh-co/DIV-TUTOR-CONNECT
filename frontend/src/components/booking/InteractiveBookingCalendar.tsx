import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { getProviderAvailableSlots } from '../../services/api';
import { CalculatedSlot } from '../../types';
import { Skeleton } from '../ui/Skeleton';

interface InteractiveBookingCalendarProps {
  providerId: number;
  durationMinutes: number;
  onSlotSelected: (slot: CalculatedSlot) => void;
  selectedSlot: CalculatedSlot | null;
}

export const InteractiveBookingCalendar: React.FC<InteractiveBookingCalendarProps> = ({
  providerId,
  durationMinutes,
  onSlotSelected,
  selectedSlot,
}) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [slotsByDate, setSlotsByDate] = useState<Record<string, CalculatedSlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const dateStr = startDate.toISOString().split('T')[0];
      const res = await getProviderAvailableSlots(providerId, {
        start_date: dateStr,
        days: 7,
        duration: durationMinutes,
      });
      const data = res.data.slots_by_date || {};
      setSlotsByDate(data);

      // Default selected date to first date with available slots or today
      const dates = Object.keys(data);
      if (dates.length > 0 && (!selectedDateStr || !dates.includes(selectedDateStr))) {
        setSelectedDateStr(dates[0]);
      }
    } catch (err) {
      console.error('Failed to fetch available slots', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (providerId) {
      fetchSlots();
    }
  }, [providerId, startDate, durationMinutes]);

  const handlePrevWeek = () => {
    const prev = new Date(startDate);
    prev.setDate(prev.getDate() - 7);
    if (prev >= new Date(new Date().setHours(0, 0, 0, 0))) {
      setStartDate(prev);
    }
  };

  const handleNextWeek = () => {
    const next = new Date(startDate);
    next.setDate(next.getDate() + 7);
    setStartDate(next);
  };

  // Generate 7 consecutive days starting from startDate
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateKey = d.toISOString().split('T')[0];
    const slots = slotsByDate[dateKey] || [];
    return {
      date: d,
      dateKey,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      hasSlots: slots.length > 0,
    };
  });

  const activeSlots = slotsByDate[selectedDateStr] || [];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 transition-colors">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Select Date & Time
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevWeek}
            disabled={startDate <= new Date(new Date().setHours(0, 0, 0, 0))}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 disabled:opacity-40 disabled:hover:bg-transparent dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Previous 7 Days"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={handleNextWeek}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-800"
            title="Next 7 Days"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Week Date Selector Carousel */}
      <div className="grid grid-cols-7 gap-1.5 py-4 border-b border-zinc-100 dark:border-zinc-800">
        {weekDays.map((day) => {
          const isSelected = selectedDateStr === day.dateKey;
          return (
            <button
              key={day.dateKey}
              onClick={() => setSelectedDateStr(day.dateKey)}
              className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all ${
                isSelected
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 dark:bg-brand-500'
                  : 'hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800/80'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold opacity-80">{day.dayName}</span>
              <span className="text-base font-bold my-0.5">{day.dayNumber}</span>
              <span className="text-[9px] opacity-70">{day.monthName}</span>
              {day.hasSlots && !isSelected && (
                <span className="mt-1 h-1 w-1 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Available Slots Grid */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Available {durationMinutes}-min slots for {selectedDateStr}:</span>
          </div>
          {selectedSlot && (
            <div className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{selectedSlot.display_time} selected</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        ) : activeSlots.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
            No open slots remaining on this day. Please check another date above.
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {activeSlots.map((slot) => {
              const isSlotSelected = selectedSlot?.start_time === slot.start_time;
              return (
                <button
                  key={slot.start_time}
                  onClick={() => onSlotSelected(slot)}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg border transition-all active:scale-95 ${
                    isSlotSelected
                      ? 'border-brand-600 bg-brand-50 text-brand-700 dark:border-brand-400 dark:bg-brand-950/70 dark:text-brand-300 ring-2 ring-brand-500/20'
                      : 'border-zinc-200 hover:border-brand-300 hover:bg-zinc-50 text-zinc-800 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:text-zinc-200'
                  }`}
                >
                  {slot.display_time}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
