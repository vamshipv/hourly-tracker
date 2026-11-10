import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Database,
  CalendarDays,
  Sun,
  Moon,
} from 'lucide-react';
import type { CalendarViewMode } from '../../types';

interface CalendarHeaderProps {
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  isSupabaseConnected: boolean;
  onOpenSettings: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  selectedDate,
  onDateChange,
  isSupabaseConnected,
  onOpenSettings,
  theme,
  onToggleTheme,
}) => {
  const handlePrev = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    onDateChange(next);
  };

  const handleNext = () => {
    const next = new Date(selectedDate);
    if (viewMode === 'day') {
      next.setDate(next.getDate() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    onDateChange(next);
  };

  const handleToday = () => {
    onDateChange(new Date());
  };

  // Format date display
  const formatDateDisplay = () => {
    if (viewMode === 'day') {
      return selectedDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }

    const curr = new Date(selectedDate);
    const day = curr.getDay();
    const diffToMonday = curr.getDate() - (day === 0 ? 6 : day - 1);
    const monday = new Date(curr.setDate(diffToMonday));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const mMonth = monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const sMonth = sunday.toLocaleDateString('en-US', {
      month: sunday.getMonth() === monday.getMonth() ? undefined : 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return `${mMonth} – ${sMonth}`;
  };

  return (
    <header className="p-4 sm:px-6 sm:py-4 bg-white/35 dark:bg-[#161619]/45 backdrop-blur-xl border-b border-black/10 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 select-none transition-colors">
      {/* Left side: Navigation & Title */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Day / Week View Switcher */}
        <div className="flex items-center p-1 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/10 dark:border-white/10">
          <button
            type="button"
            onClick={() => onViewModeChange('day')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'day'
                ? 'bg-white dark:bg-[#2E2840] text-[#222522] dark:text-[#C5BBE3] shadow-2xs'
                : 'text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2]'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Daily</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('week')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              viewMode === 'week'
                ? 'bg-white dark:bg-[#2E2840] text-[#222522] dark:text-[#C5BBE3] shadow-2xs'
                : 'text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Weekly</span>
          </button>
        </div>

        {/* Date Stepper */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-2xl p-1 shadow-2xs">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-xl text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2] hover:bg-[#F2EFEA] dark:hover:bg-[#292830] transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-medium text-[#444A44] dark:text-[#C5C0D0] hover:text-[#222522] dark:hover:text-[#EDEBF2] hover:bg-[#F2EFEA] dark:hover:bg-[#292830] rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-xl text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2] hover:bg-[#F2EFEA] dark:hover:bg-[#292830] transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <h2 className="text-sm sm:text-base font-bold text-[#222522] dark:text-[#EDEBF2] tracking-tight">
          {formatDateDisplay()}
        </h2>
      </div>

      {/* Right side: Theme Toggle & Supabase Settings */}
      <div className="flex items-center gap-2.5">
        {/* Dark/Light Theme Toggle Pill */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-2xl border border-[#E5E0D8] dark:border-[#2E2D36] bg-white dark:bg-[#201F24] text-[#555C55] dark:text-[#C5C0D0] hover:bg-[#F4EFEA] dark:hover:bg-[#292830] transition-all"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#D8E575]" />
          ) : (
            <Moon className="w-4 h-4 text-[#5F665F]" />
          )}
        </button>

        {/* Supabase Connection Status / Settings Button */}
        <button
          type="button"
          onClick={onOpenSettings}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-xs font-medium transition-all ${
            isSupabaseConnected
              ? 'bg-[#E5EEE6] dark:bg-[#2E2840] border-[#CADBCB] dark:border-[#453E60] text-[#2D4532] dark:text-[#C5BBE3] hover:bg-[#DCE8DD] dark:hover:bg-[#38314E]'
              : 'bg-white dark:bg-[#201F24] border-[#E5E0D8] dark:border-[#2E2D36] text-[#555C55] dark:text-[#C5C0D0] hover:bg-[#F4EFEA] dark:hover:bg-[#292830]'
          }`}
          title="Supabase sync settings"
        >
          <Database className="w-3.5 h-3.5" />
          <span>{isSupabaseConnected ? 'Supabase Synced' : 'Local Storage'}</span>
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConnected ? 'bg-[#436249] dark:bg-[#D8E575]' : 'bg-[#C07D2B]'
            }`}
          />
        </button>
      </div>
    </header>
  );
};
