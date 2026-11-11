import React, { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import type { CalendarEntry } from '../../types';
import { EntryCard } from './EntryCard';

interface WeekViewProps {
  selectedDate: Date;
  entries: CalendarEntry[];
  onDeleteEntry: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleBullet: (entryId: string, bulletId: string) => void;
  onEditEntry: (entry: CalendarEntry) => void;
  onSelectDate: (date: Date) => void;
}

function getWeekDays(referenceDate: Date): Date[] {
  const curr = new Date(referenceDate);
  const day = curr.getDay();
  // Monday as the first day of week:
  const diffToMonday = curr.getDate() - (day === 0 ? 6 : day - 1);
  const monday = new Date(curr.setDate(diffToMonday));

  const week: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

function formatDateStr(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour} ${period}`;
}

// Droppable Cell in the Week Grid
interface WeekGridCellProps {
  dateStr: string;
  hour: number;
  entries: CalendarEntry[];
  onDeleteEntry: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleBullet: (entryId: string, bulletId: string) => void;
  onEditEntry: (entry: CalendarEntry) => void;
}

const WeekGridCell: React.FC<WeekGridCellProps> = ({
  dateStr,
  hour,
  entries,
  onDeleteEntry,
  onToggleComplete,
  onToggleBullet,
  onEditEntry,
}) => {
  const cellId = `slot-${dateStr}-${hour}`;
  const { isOver, setNodeRef } = useDroppable({
    id: cellId,
    data: {
      type: 'CALENDAR_SLOT',
      date: dateStr,
      hour,
    },
  });

  const now = new Date();
  const todayStr = formatDateStr(now);
  const isCurrentCell = dateStr === todayStr && now.getHours() === hour;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[70px] p-1.5 rounded-xl transition-all text-xs ${
        isOver
          ? 'bg-[#E5EEE6]/70 dark:bg-[#252233] border-[#436249] dark:border-[#9D8EC9] ring-2 ring-[#436249]/30 dark:ring-[#9D8EC9]/30 shadow-xs border'
          : isCurrentCell
          ? 'min-h-[80px] bg-white/80 dark:bg-[#201F24]/90 border-2 border-[#FDE047] dark:border-[#FFE066] scale-[1.015] z-10'
          : entries.length > 0
          ? 'bg-transparent border-transparent border'
          : 'bg-white/20 dark:bg-[#1A191E]/30 border border-black/10 dark:border-white/10 hover:bg-white/40 dark:hover:bg-[#201F24]/50 hover:border-black/20 dark:hover:border-white/20 backdrop-blur-xs'
      }`}
    >
      {entries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onDelete={onDeleteEntry}
          onToggleComplete={onToggleComplete}
          onToggleBullet={onToggleBullet}
          onEdit={onEditEntry}
          compact
        />
      ))}
    </div>
  );
};

export const WeekView: React.FC<WeekViewProps> = ({
  selectedDate,
  entries,
  onDeleteEntry,
  onToggleComplete,
  onToggleBullet,
  onEditEntry,
  onSelectDate,
}) => {
  const weekDays = getWeekDays(selectedDate);
  // Full 24-hour day time: 0 to 23 (12 AM to 11 PM)
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const now = new Date();
  const todayStr = formatDateStr(now);
  const scrollTargetHour = now.getHours();

  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollTargetRef.current) {
        scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [selectedDate]);

  return (
    <div className="p-4 sm:p-6 overflow-x-auto">
      <div className="min-w-[850px]">
        {/* Week Columns Header */}
        <div className="grid grid-cols-[70px_repeat(7,1fr)] gap-2 mb-3 pb-3 border-b border-black/10 dark:border-white/10">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#555C55] dark:text-[#C5BBE3] pt-2 text-right pr-2">
            Time
          </div>
          {weekDays.map((day) => {
            const dateStr = formatDateStr(day);
            const isToday = dateStr === todayStr;
            const isSelected = formatDateStr(selectedDate) === dateStr;

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => onSelectDate(day)}
                className={`text-center p-2 rounded-2xl transition-all ${
                  isSelected
                    ? 'bg-[#222522] dark:bg-[#9D8EC9] text-white dark:text-[#161619] shadow-xs'
                    : isToday
                    ? 'bg-[#E5EEE6]/90 dark:bg-[#2E2840]/90 text-[#2D4532] dark:text-[#E2EB89] border border-[#CADBCB] dark:border-[#453E60]'
                    : 'bg-white/45 dark:bg-[#201F24]/60 border border-black/10 dark:border-white/10 text-[#303530] dark:text-[#C5C0D0] hover:bg-white/70 dark:hover:bg-[#292830]/80'
                }`}
              >
                <div className="text-[11px] font-medium uppercase tracking-wider">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-base font-bold mt-0.5">
                  {day.getDate()}
                </div>
                {isToday && (
                  <div className="text-[9px] font-bold tracking-tight uppercase">
                    Today
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Hourly Rows */}
        <div className="space-y-2">
          {hours.map((hour) => {
            const isScrollTarget = hour === scrollTargetHour;
            const isCurrentHour = now.getHours() === hour;
            return (
              <div
                key={hour}
                ref={isScrollTarget ? scrollTargetRef : undefined}
                className="grid grid-cols-[70px_repeat(7,1fr)] gap-2 items-start"
              >
                {/* Hour Label */}
                <div className="text-[11px] font-semibold text-[#666C66] dark:text-[#9E9AA8] pt-2 text-right pr-2 select-none flex flex-col items-end">
                  <span className={isCurrentHour ? 'font-bold text-[#1E3023] dark:text-[#EDEBF2]' : ''}>
                    {formatHour(hour)}
                  </span>
                  {isCurrentHour && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-0.5 rounded-full bg-[#F5F8E6] dark:bg-[#252818] border border-[#D5E29D] dark:border-[#4B5226]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] dark:bg-[#22C55E] animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#6B7E28] dark:text-[#E2EB89]">
                        Now
                      </span>
                    </span>
                  )}
                </div>

              {/* 7 Days for this hour */}
              {weekDays.map((day) => {
                const dateStr = formatDateStr(day);
                const cellEntries = entries.filter(
                  (e) => e.date === dateStr && e.hour === hour
                );

                return (
                  <WeekGridCell
                    key={`${dateStr}-${hour}`}
                    dateStr={dateStr}
                    hour={hour}
                    entries={cellEntries}
                    onDeleteEntry={onDeleteEntry}
                    onToggleComplete={onToggleComplete}
                    onToggleBullet={onToggleBullet}
                    onEditEntry={onEditEntry}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};
