import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 mt-auto transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white dark:bg-brand-500">
                <GraduationCap className="h-4 w-4" />
              </div>
              <span className="text-base tracking-tight">Tutor<span className="text-brand-600 dark:text-brand-400">Connect</span></span>
            </Link>
            <p className="text-xs text-zinc-500 leading-relaxed dark:text-zinc-400">
              The premier marketplace connecting high-caliber, verified tutors with ambitious learners for 1-on-1 bookings.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Systems Operational & Online</span>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Top Categories
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><Link to="/tutors?category=mathematics" className="hover:text-brand-600 dark:hover:text-brand-400">Calculus & Math</Link></li>
              <li><Link to="/tutors?category=computer_science" className="hover:text-brand-600 dark:hover:text-brand-400">Computer Science & Python</Link></li>
              <li><Link to="/tutors?category=sciences" className="hover:text-brand-600 dark:hover:text-brand-400">Physics & Organic Chem</Link></li>
              <li><Link to="/tutors?category=test_prep" className="hover:text-brand-600 dark:hover:text-brand-400">Digital SAT & ACT Prep</Link></li>
              <li><Link to="/tutors?category=languages" className="hover:text-brand-600 dark:hover:text-brand-400">Languages & French</Link></li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Platform
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li><Link to="/tutors" className="hover:text-brand-600 dark:hover:text-brand-400">Browse All Tutors</Link></li>
              <li><Link to="/auth?tab=register&role=provider" className="hover:text-brand-600 dark:hover:text-brand-400">Become a Tutor</Link></li>
              <li><Link to="/dashboard/client" className="hover:text-brand-600 dark:hover:text-brand-400">Client Portal</Link></li>
              <li><a href="/api/docs/" target="_blank" rel="noreferrer" className="hover:text-brand-600 dark:hover:text-brand-400">Swagger API Docs</a></li>
            </ul>
          </div>

          {/* Trust & Guarantees */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-900 dark:text-zinc-200">
              Security & Guarantee
            </h4>
            <div className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-500" />
                <span>Encrypted Stripe Payments</span>
              </div>
              <p className="text-[11px] text-zinc-400 dark:text-zinc-500 leading-normal">
                All tutors are verified and sessions are covered by our 100% Satisfaction Guarantee.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer with subtle, tasteful Watermark */}
        <div className="mt-12 pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 dark:text-zinc-600">
          <p>© {new Date().getFullYear()} TutorConnect Marketplace Inc. All rights reserved.</p>

          {/* Required Anti-Copy Watermark Credit */}
          <div className="flex flex-wrap items-center gap-2 p-2 px-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs select-none">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-zinc-600 dark:text-zinc-400">Designed & Engineered by</span>
            <a
              href="https://github.com/Divyansh-co"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-zinc-950 dark:text-white hover:text-brand-600 dark:hover:text-brand-400 transition-colors underline decoration-brand-500 underline-offset-4"
            >
              Divyansh Mishra (@divyanshmishra)
            </a>
            <span className="text-zinc-400 font-mono text-[11px]">• Proprietary Showcase</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
