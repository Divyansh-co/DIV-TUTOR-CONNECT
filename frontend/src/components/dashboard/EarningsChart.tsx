import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DollarSign, TrendingUp, Clock, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { EarningsData } from '../../types';
import { Button } from '../ui/Button';
import { requestPayout } from '../../services/api';

interface EarningsChartProps {
  earnings: EarningsData;
  onPayoutSuccess: () => void;
}

export const EarningsChart: React.FC<EarningsChartProps> = ({ earnings, onPayoutSuccess }) => {
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [payoutMsg, setPayoutMsg] = useState<string | null>(null);

  const handleSimulatePayout = async () => {
    setPayoutLoading(true);
    setPayoutMsg(null);
    try {
      const res = await requestPayout();
      setPayoutMsg(res.data.message || 'Payout initiated successfully!');
      onPayoutSuccess();
    } catch (err: any) {
      setPayoutMsg(err.response?.data?.error || 'Payout request failed.');
    } finally {
      setPayoutLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Total Gross Earned</span>
            <DollarSign className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ${earnings.gross_earned.toFixed(2)}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Platform fee (10%): -${earnings.fees_paid.toFixed(2)}</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Net Take-Home</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${earnings.net_earned.toFixed(2)}
          </div>
          <div className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">90% net revenue kept</div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Available for Payout</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            ${earnings.available_balance.toFixed(2)}
          </div>
          <div className="mt-2">
            <Button
              size="sm"
              variant="outline"
              disabled={earnings.available_balance <= 5 || payoutLoading}
              isLoading={payoutLoading}
              onClick={handleSimulatePayout}
              className="w-full text-xs"
            >
              Simulate Stripe Payout
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
            <span>Completed Sessions</span>
            <CheckCircle2 className="w-4 h-4 text-brand-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            {earnings.completed_sessions}
          </div>
          <div className="text-[11px] text-zinc-400 mt-1">Total completed client sessions</div>
        </div>
      </div>

      {payoutMsg && (
        <div className="p-3 text-xs rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
          {payoutMsg}
        </div>
      )}

      {/* Monthly Chart */}
      <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between pb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              Monthly Revenue Performance
            </h3>
            <p className="text-xs text-zinc-500">6-Month net earnings trajectory</p>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={earnings.monthly_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" opacity={0.6} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
              <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" tickFormatter={(v) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  borderRadius: '8px',
                  border: '1px solid #27272a',
                  color: '#fff',
                  fontSize: '12px',
                }}
                formatter={(val: any) => [`$${parseFloat(val).toFixed(2)}`, 'Net Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRev)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
