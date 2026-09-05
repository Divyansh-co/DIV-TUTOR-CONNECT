import React, { useState } from 'react';
import { Plus, Trash2, Clock, CalendarCheck } from 'lucide-react';
import { AvailabilitySlot } from '../../types';
import { Button } from '../ui/Button';
import { createAvailabilitySlot, deleteAvailabilitySlot } from '../../services/api';

const DAYS = [
  { id: 0, label: 'Monday' },
  { id: 1, label: 'Tuesday' },
  { id: 2, label: 'Wednesday' },
  { id: 3, label: 'Thursday' },
  { id: 4, label: 'Friday' },
  { id: 5, label: 'Saturday' },
  { id: 6, label: 'Sunday' },
];

interface AvailabilityGridProps {
  slots: AvailabilitySlot[];
  onSlotsUpdated: () => void;
}

export const AvailabilityGrid: React.FC<AvailabilityGridProps> = ({ slots, onSlotsUpdated }) => {
  const [selectedDay, setSelectedDay] = useState(0);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      await createAvailabilitySlot({
        day_of_week: selectedDay,
        start_time: startTime,
        end_time: endTime,
        is_active: true,
      });
      onSlotsUpdated();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.non_field_errors?.[0] || 'Failed to add slot. It may overlap with an existing slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id: number) => {
    try {
      await deleteAvailabilitySlot(id);
      onSlotsUpdated();
    } catch (err) {}
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Weekly Recurring Availability
          </h3>
          <p className="text-xs text-zinc-500">
            Define recurring hours when clients are allowed to book appointments.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-3 text-xs rounded-lg bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
          {errorMsg}
        </div>
      )}

      {/* Add Slot Bar */}
      <form onSubmit={handleAddSlot} className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Day of Week</label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(parseInt(e.target.value))}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          >
            {DAYS.map((d) => (
              <option key={d.id} value={d.id}>{d.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-zinc-500 mb-1">End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs text-zinc-800 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            required
          />
        </div>

        <Button type="submit" size="sm" variant="primary" isLoading={loading}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Hours
        </Button>
      </form>

      {/* Slots List by Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {DAYS.map((day) => {
          const daySlots = slots.filter((s) => s.day_of_week === day.id);
          return (
            <div
              key={day.id}
              className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{day.label}</span>
                <span className="text-[10px] text-zinc-400">{daySlots.length} window(s)</span>
              </div>

              {daySlots.length === 0 ? (
                <p className="text-xs text-zinc-400 py-2 italic">Unavailable</p>
              ) : (
                <div className="space-y-1.5">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/70 text-xs text-zinc-700 dark:text-zinc-300"
                    >
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-brand-500" />
                        <span>{slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteSlot(slot.id)}
                        className="text-zinc-400 hover:text-red-500 p-1"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
