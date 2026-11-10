import React, { useRef, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import type { CalendarEntry, Block } from '../../types';
import { EntryCard } from './EntryCard';

interface DayViewProps {
  date: Date;
  entries: CalendarEntry[];
  blocks: Block[];
  onQuickAddBlock: (hour: number, blockId: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleBullet: (entryId: string, bulletId: string) => void;
  onEditEntry: (entry: CalendarEntry) => void;
}

// Format hour helper (8 -> "8:00 AM", 13 -> "1:00 PM", 21 -> "9:00 PM")
function formatHour(hour: number): { time: string; period: string } {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return { time: `${displayHour}:00`, period };
}

// Hourly Droppable Row Component
interface HourSlotProps {
  hour: number;
  dateStr: string;
  entries: CalendarEntry[];
  blocks: Block[];
  onQuickAddBlock: (hour: number, blockId: string) => void;
  onDeleteEntry: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleBullet: (entryId: string, bulletId: string) => void;
  onEditEntry: (entry: CalendarEntry) => void;
}

const HourSlot: React.FC<HourSlotProps> = ({
  hour,
  dateStr,
  entries,
  blocks,
  onQuickAddBlock,
  onDeleteEntry,
  onToggleComplete,
  onToggleBullet,
  onEditEntry,
}) => {
  const slotId = `slot-${dateStr}-${hour}`;
  const { isOver, setNodeRef } = useDroppable({
    id: slotId,
    data: {
      type: 'CALENDAR_SLOT',
      date: dateStr,
      hour,
    },
  });

  const { time, period } = formatHour(hour);
  const [showQuickSelect, setShowQuickSelect] = React.useState(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isCurrentHour = todayStr === dateStr && now.getHours() === hour;

  return (
    <div
      ref={setNodeRef}
      className={`group relative flex items-start gap-3 sm:gap-4 p-3 rounded-2xl border transition-all duration-150 backdrop-blur-md ${
        isOver
          ? 'bg-[#E5EEE6]/80 dark:bg-[#252233]/85 border-[#436249] dark:border-[#9D8EC9] shadow-md ring-2 ring-[#436249]/30 dark:ring-[#9D8EC9]/30'
          : isCurrentHour
          ? 'bg-white/70 dark:bg-[#201F24]/75 border-[#B2C6B4] dark:border-[#4E4766] shadow-xs ring-1 ring-[#436249]/20 dark:ring-[#9D8EC9]/20'
          : 'bg-white/30 dark:bg-[#161619]/40 border-black/10 dark:border-white/10 hover:bg-white/50 dark:hover:bg-[#201F24]/55 hover:border-black/20 dark:hover:border-white/20'
      }`}
    >
      {/* Time Label Column */}
      <div className="w-16 sm:w-20 pt-1 shrink-0 select-none text-right">
        <span className="text-xs sm:text-sm font-semibold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
          {time}
        </span>
        <span className="text-[10px] font-medium text-[#7A827A] dark:text-[#9E9AA8] ml-1 uppercase">
          {period}
        </span>
        {isCurrentHour && (
          <div className="text-[10px] font-bold text-[#436249] dark:text-[#D8E575] uppercase tracking-wider mt-0.5">
            Now
          </div>
        )}
      </div>

      {/* Main Slot Container */}
      <div className="flex-1 min-w-0 space-y-2.5">
        {entries.length === 0 ? (
          <div className="min-h-[58px] flex items-center justify-between px-3 py-2 rounded-xl border border-dashed border-black/15 dark:border-white/15 bg-white/25 dark:bg-black/20 text-xs text-[#3E433E] dark:text-[#C5BBE3] transition-colors group-hover:border-[#436249] dark:group-hover:border-[#9D8EC9]">
            <span className="italic select-none">
              {isOver ? 'Drop block here' : 'Free slot — drag a block here or add'}
            </span>

            {/* Quick Add Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowQuickSelect(!showQuickSelect)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium text-[#4D534D] dark:text-[#C5BBE3] bg-[#EFEBE5] dark:bg-[#2E2840] hover:bg-[#E5DFD6] dark:hover:bg-[#3B3454] hover:text-[#222522] dark:hover:text-[#FFFFFF] transition-colors"
                title="Quick assign a block to this hour"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Assign</span>
              </button>

              {/* Quick Select Dropdown */}
              {showQuickSelect && (
                <div className="absolute right-0 top-8 z-30 w-56 p-1.5 bg-white dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-2xl shadow-xl space-y-1">
                  <div className="px-2 py-1 text-[11px] font-semibold text-[#6E746E] dark:text-[#9E9AA8] uppercase tracking-wider border-b border-[#F0ECE6] dark:border-[#2E2D36]">
                    Select Block
                  </div>
                  {blocks.length === 0 ? (
                    <div className="p-2 text-xs text-[#8A908A] dark:text-[#7D7988] text-center">
                      No blocks in bank.
                    </div>
                  ) : (
                    blocks.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => {
                          onQuickAddBlock(hour, b.id);
                          setShowQuickSelect(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-medium text-[#303530] dark:text-[#C5C0D0] hover:bg-[#F2EFEA] dark:hover:bg-[#2E2840] truncate flex items-center justify-between"
                      >
                        <span className="truncate">{b.title}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onDelete={onDeleteEntry}
                onToggleComplete={onToggleComplete}
                onToggleBullet={onToggleBullet}
                onEdit={onEditEntry}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const DayView: React.FC<DayViewProps> = ({
  date,
  entries,
  blocks,
  onQuickAddBlock,
  onDeleteEntry,
  onToggleComplete,
  onToggleBullet,
  onEditEntry,
}) => {
  // Full 24-hour day time: 0 to 23 (12:00 AM to 11:00 PM)
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`;
  const isToday = todayStr === dateStr;
  const scrollTargetHour = isToday ? now.getHours() : 8;

  const scrollTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Auto-scroll into view smoothly so the user doesn't have to scroll past midnight
    const timer = setTimeout(() => {
      if (scrollTargetRef.current) {
        scrollTargetRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [dateStr]);

  const entriesForDate = entries.filter((e) => e.date === dateStr);

  return (
    <div className="space-y-3 p-4 sm:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between pb-2 border-b border-black/10 dark:border-white/10">
        <div className="text-xs font-semibold uppercase tracking-wider text-[#353A35] dark:text-[#D5CEE8]">
          Hourly Schedule (12:00 AM – 11:00 PM)
        </div>
        <div className="text-xs text-[#555C55] dark:text-[#ABA4B8]">
          {entriesForDate.length} {entriesForDate.length === 1 ? 'activity' : 'activities'} planned
        </div>
      </div>

      <div className="space-y-2.5">
        {hours.map((hour) => {
          const slotEntries = entriesForDate.filter((e) => e.hour === hour);
          const isScrollTarget = hour === scrollTargetHour;
          return (
            <div
              key={hour}
              ref={isScrollTarget ? scrollTargetRef : undefined}
            >
              <HourSlot
                hour={hour}
                dateStr={dateStr}
                entries={slotEntries}
                blocks={blocks}
                onQuickAddBlock={onQuickAddBlock}
                onDeleteEntry={onDeleteEntry}
                onToggleComplete={onToggleComplete}
                onToggleBullet={onToggleBullet}
                onEditEntry={onEditEntry}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
