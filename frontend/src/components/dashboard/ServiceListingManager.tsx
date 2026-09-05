import React, { useState } from 'react';
import { Plus, Pause, Play, Trash2, Tag, DollarSign, Clock } from 'lucide-react';
import { ServiceListing } from '../../types';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { createServiceListing, updateServiceListing, deleteServiceListing } from '../../services/api';

interface ServiceListingManagerProps {
  services: ServiceListing[];
  onServicesUpdated: () => void;
}

export const ServiceListingManager: React.FC<ServiceListingManagerProps> = ({
  services,
  onServicesUpdated,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('mathematics');
  const [price, setPrice] = useState('60.00');
  const [duration, setDuration] = useState('60');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createServiceListing({
        title,
        category,
        price: parseFloat(price),
        duration_minutes: parseInt(duration),
        description,
        is_paused: false,
      });
      setIsModalOpen(false);
      setTitle('');
      setDescription('');
      onServicesUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePause = async (service: ServiceListing) => {
    try {
      await updateServiceListing(service.id, { is_paused: !service.is_paused });
      onServicesUpdated();
    } catch (err) {}
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this service?')) return;
    try {
      await deleteServiceListing(id);
      onServicesUpdated();
    } catch (err) {}
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Offered Services & Packages
          </h3>
          <p className="text-xs text-zinc-500">
            Define the subjects, rates, and session durations available for clients to book.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-3.5 h-3.5 mr-1" />
          Create Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((svc) => (
          <div
            key={svc.id}
            className={`p-4 rounded-xl border transition-all ${
              svc.is_paused
                ? 'border-zinc-200/60 bg-zinc-50/50 opacity-60 dark:border-zinc-800/60 dark:bg-zinc-900/40'
                : 'border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {svc.category_display || svc.category}
                </span>
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5">
                  {svc.title}
                </h4>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                  ${parseFloat(svc.price.toString()).toFixed(2)}
                </span>
                <span className="text-[11px] text-zinc-500 block">
                  {svc.duration_minutes} min
                </span>
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 line-clamp-2">
              {svc.description}
            </p>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800">
              <span className={`text-[11px] font-medium ${svc.is_paused ? 'text-amber-500' : 'text-emerald-500'}`}>
                {svc.is_paused ? '● Paused' : '● Active on profile'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTogglePause(svc)}
                  className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title={svc.is_paused ? 'Resume listing' : 'Pause listing'}
                >
                  {svc.is_paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => handleDelete(svc.id)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  title="Delete listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Service Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Service Offering">
        <form onSubmit={handleCreateService} className="space-y-4">
          <Input
            label="Service Title"
            placeholder="e.g. 1-on-1 AP Calculus Preparation"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Subject Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              >
                <option value="mathematics">Mathematics & Statistics</option>
                <option value="computer_science">Computer Science & Coding</option>
                <option value="sciences">Physics, Chemistry & Biology</option>
                <option value="languages">Languages & Literature</option>
                <option value="test_prep">SAT, ACT & Standardized Tests</option>
                <option value="music">Music & Instruments</option>
                <option value="business">Business & Economics</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="5"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Session Duration (minutes)
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes (1 hour)</option>
              <option value="90">90 minutes (1.5 hours)</option>
              <option value="120">120 minutes (2 hours)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              Description & Learning Goals
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain what topics are covered, prerequisites, and what students will achieve."
              className="w-full rounded-lg border border-zinc-200 bg-white p-3 text-xs text-zinc-900 placeholder-zinc-400 focus:border-brand-500 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={loading}>
              Publish Service
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
