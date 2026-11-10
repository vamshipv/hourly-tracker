import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent, DropAnimation } from '@dnd-kit/core';
import { BlockSidebar } from './components/blocks/BlockSidebar';
import { BlockModal } from './components/blocks/BlockModal';
import { CalendarHeader } from './components/calendar/CalendarHeader';
import { DayView } from './components/calendar/DayView';
import { WeekView } from './components/calendar/WeekView';
import { CalendarEntryModal } from './components/calendar/CalendarEntryModal';
import { SupabaseModal } from './components/settings/SupabaseModal';
import type { Block, CalendarEntry, CalendarViewMode } from './types';
import {
  fetchBlocksData,
  saveBlockData,
  deleteBlockData,
  fetchCalendarEntriesData,
  saveCalendarEntryData,
  deleteCalendarEntryData,
  getStoredSupabaseConfig,
} from './services/supabase';
import { COLOR_SCHEMES } from './utils/theme';

export function App() {
  // -------------------------------------------------------------
  // Theme State (Dark / Light)
  // -------------------------------------------------------------
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('planner_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('planner_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // -------------------------------------------------------------
  // Data State
  // -------------------------------------------------------------
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [viewMode, setViewMode] = useState<CalendarViewMode>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // Modals & settings
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [editingCalendarEntry, setEditingCalendarEntry] = useState<CalendarEntry | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Drag & drop active state
  const [activeDragBlock, setActiveDragBlock] = useState<Block | null>(null);

  // Configure pointer sensor with a 6px drag threshold to allow crisp clicks
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    })
  );

  // In-place drop animation: dissolves right where placed without flying back to the sidebar
  const dropAnimationConfig: DropAnimation = {
    keyframes({ transform }) {
      return [
        { opacity: 1, transform: `${transform.initial}` },
        { opacity: 0, transform: `${transform.initial} scale(0.96)` },
      ];
    },
    duration: 160,
    easing: 'ease-out',
    sideEffects: () => {},
  };

  // -------------------------------------------------------------
  // Data Loading (Supabase prioritized when connected)
  // -------------------------------------------------------------
  const loadInitialData = useCallback(async () => {
    const config = getStoredSupabaseConfig();
    setIsSupabaseConnected(config.connected);

    const [loadedBlocks, loadedEntries] = await Promise.all([
      fetchBlocksData(),
      fetchCalendarEntriesData(),
    ]);

    setBlocks(loadedBlocks);
    setCalendarEntries(loadedEntries);
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // -------------------------------------------------------------
  // Block Operations (Left drawer templates only)
  // -------------------------------------------------------------
  const handleOpenAddBlock = () => {
    setEditingBlock(null);
    setIsBlockModalOpen(true);
  };

  const handleOpenEditBlock = (block: Block) => {
    setEditingBlock(block);
    setIsBlockModalOpen(true);
  };

  const handleDuplicateBlock = async (block: Block) => {
    const duplicated: Block = {
      ...block,
      id: crypto.randomUUID(),
      title: `${block.title} (Copy)`,
      bullets: block.bullets.map((b) => ({ ...b, id: crypto.randomUUID() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveBlockData(duplicated);
    setBlocks((prev) => [duplicated, ...prev]);
  };

  const handleSaveBlock = async (
    blockData: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => {
    const now = new Date().toISOString();
    const updated: Block = {
      ...blockData,
      id: existingId || crypto.randomUUID(),
      createdAt: existingId
        ? blocks.find((b) => b.id === existingId)?.createdAt || now
        : now,
      updatedAt: now,
    };

    await saveBlockData(updated);
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });
  };

  const handleDeleteBlock = async (id: string) => {
    await deleteBlockData(id);
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  // -------------------------------------------------------------
  // Calendar Entries Operations (Instant, isolated from block templates)
  // -------------------------------------------------------------
  const handleScheduleBlock = async (
    block: Block,
    dateStr: string,
    hour: number
  ) => {
    const newEntry: CalendarEntry = {
      id: crypto.randomUUID(),
      blockId: block.id,
      title: block.title,
      bullets: block.bullets.map((b) => ({ ...b, id: crypto.randomUUID(), completed: false })),
      tagColor: block.tagColor,
      date: dateStr,
      hour,
      durationMinutes: 60,
      completed: false,
    };

    await saveCalendarEntryData(newEntry);
    setCalendarEntries((prev) => [...prev, newEntry]);
  };

  const handleQuickAddBlock = (hour: number, blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const dateStr = `${selectedDate.getFullYear()}-${String(
      selectedDate.getMonth() + 1
    ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

    handleScheduleBlock(block, dateStr, hour);
  };

  const handleDeleteCalendarEntry = async (id: string) => {
    await deleteCalendarEntryData(id);
    setCalendarEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Title completion cascades to ALL bullet points in this card
  const handleToggleEntryComplete = async (id: string) => {
    const entry = calendarEntries.find((e) => e.id === id);
    if (!entry) return;

    const willBeCompleted = !entry.completed;
    const updatedBullets = (entry.bullets || []).map((b) => ({
      ...b,
      completed: willBeCompleted,
    }));

    const updated: CalendarEntry = {
      ...entry,
      completed: willBeCompleted,
      bullets: updatedBullets,
    };

    await saveCalendarEntryData(updated);
    setCalendarEntries((prev) => prev.map((e) => (e.id === id ? updated : e)));
  };

  // Toggling an individual bullet only toggles that bullet
  const handleToggleBullet = async (entryId: string, bulletId: string) => {
    const entry = calendarEntries.find((e) => e.id === entryId);
    if (!entry) return;

    const updatedBullets = (entry.bullets || []).map((b) =>
      b.id === bulletId ? { ...b, completed: !b.completed } : b
    );

    const updated: CalendarEntry = {
      ...entry,
      bullets: updatedBullets,
    };

    await saveCalendarEntryData(updated);
    setCalendarEntries((prev) => prev.map((e) => (e.id === entryId ? updated : e)));
  };

  // Dedicated calendar entry editing (affects ONLY the calendar, NOT block templates)
  const handleSaveCalendarEntry = async (updatedEntry: CalendarEntry) => {
    await saveCalendarEntryData(updatedEntry);
    setCalendarEntries((prev) =>
      prev.map((e) => (e.id === updatedEntry.id ? updatedEntry : e))
    );
  };

  // -------------------------------------------------------------
  // Drag & Drop Handlers
  // -------------------------------------------------------------
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;
    if (activeData?.type === 'BLOCK_TEMPLATE') {
      setActiveDragBlock(activeData.block as Block);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragBlock(null);

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    if (
      activeData?.type === 'BLOCK_TEMPLATE' &&
      overData?.type === 'CALENDAR_SLOT'
    ) {
      const block = activeData.block as Block;
      const { date, hour } = overData as { date: string; hour: number };

      await handleScheduleBlock(block, date, hour);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="relative flex flex-col h-screen w-screen overflow-hidden text-[#222522] dark:text-[#EDEBF2] transition-colors">
        {/* Full-bleed Scenic Wallpaper Background - 80% Visibility */}
        <div
          className="fixed inset-0 pointer-events-none z-0 bg-cover bg-center select-none"
          style={{ backgroundImage: `url('/background.jpg')` }}
        >
          {/* Very light 10% / 20% tint overlay so 80%+ of the wallpaper is clearly visible */}
          <div className="absolute inset-0 bg-white/10 dark:bg-black/25 transition-colors duration-300" />
        </div>

        {/* Main Application Container */}
        <div className="relative z-10 flex flex-1 flex-col lg:flex-row h-full overflow-hidden">
          {/* Left Block Bank: 30% Width */}
          <BlockSidebar
            blocks={blocks}
            onAddNew={handleOpenAddBlock}
            onEdit={handleOpenEditBlock}
            onDuplicate={handleDuplicateBlock}
            onDelete={handleDeleteBlock}
          />

          {/* Right Calendar View: 70% Width (Transparent to let wallpaper show through) */}
          <main className="flex-1 flex flex-col h-full overflow-hidden bg-transparent transition-colors">
            <CalendarHeader
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              isSupabaseConnected={isSupabaseConnected}
              onOpenSettings={() => setIsSupabaseModalOpen(true)}
              theme={theme}
              onToggleTheme={handleToggleTheme}
            />

            <div className="flex-1 overflow-y-auto">
              {viewMode === 'day' ? (
                <DayView
                  date={selectedDate}
                  entries={calendarEntries}
                  blocks={blocks}
                  onQuickAddBlock={handleQuickAddBlock}
                  onDeleteEntry={handleDeleteCalendarEntry}
                  onToggleComplete={handleToggleEntryComplete}
                  onToggleBullet={handleToggleBullet}
                  onEditEntry={(entry) => setEditingCalendarEntry(entry)}
                />
              ) : (
                <WeekView
                  selectedDate={selectedDate}
                  entries={calendarEntries}
                  onDeleteEntry={handleDeleteCalendarEntry}
                  onToggleComplete={handleToggleEntryComplete}
                  onToggleBullet={handleToggleBullet}
                  onEditEntry={(entry) => setEditingCalendarEntry(entry)}
                  onSelectDate={(newDate) => {
                    setSelectedDate(newDate);
                    setViewMode('day');
                  }}
                />
              )}
            </div>
          </main>
        </div>

        {/* Floating Drag Overlay - Lifted Ghost Clone */}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeDragBlock && (
            <div
              className={`p-3.5 rounded-2xl border ${
                COLOR_SCHEMES[activeDragBlock.tagColor].cardBorder
              } ${
                COLOR_SCHEMES[activeDragBlock.tagColor].cardBg
              } shadow-2xl ring-2 ring-[#436249]/30 dark:ring-[#9D8EC9]/30 select-none cursor-grabbing backdrop-blur-md w-[320px] pointer-events-none`}
            >
              {/* Header with tag badge */}
              <div className="flex items-center justify-between pb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${
                    COLOR_SCHEMES[activeDragBlock.tagColor].badgeBg
                  } ${COLOR_SCHEMES[activeDragBlock.tagColor].badgeText}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      backgroundColor: COLOR_SCHEMES[activeDragBlock.tagColor].solid,
                    }}
                  />
                  {COLOR_SCHEMES[activeDragBlock.tagColor].name}
                </span>
                <span className="text-[10px] font-medium text-[#7A827A] dark:text-[#9E9AA8] italic">
                  Drop into slot
                </span>
              </div>

              {/* Title */}
              <h4 className="text-sm font-semibold tracking-tight text-[#222522] dark:text-[#EDEBF2] truncate">
                {activeDragBlock.title}
              </h4>

              {/* Bullets Preview */}
              {activeDragBlock.bullets && activeDragBlock.bullets.length > 0 && (
                <div className="mt-2 space-y-1 pt-1.5 border-t border-black/5 dark:border-white/5">
                  {activeDragBlock.bullets.slice(0, 3).map((bullet) => (
                    <div
                      key={bullet.id}
                      className="flex items-center gap-1.5 text-xs text-[#525952] dark:text-[#B4ADC4] truncate"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#8E968E] dark:bg-[#9D8EC9] shrink-0" />
                      <span className="truncate">{bullet.text}</span>
                    </div>
                  ))}
                  {activeDragBlock.bullets.length > 3 && (
                    <div className="text-[10px] text-[#7E857E] dark:text-[#9E9AA8] italic pl-3">
                      +{activeDragBlock.bullets.length - 3} more items
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DragOverlay>

        {/* Create / Edit Block Template Modal (Drawer) */}
        <BlockModal
          isOpen={isBlockModalOpen}
          onClose={() => setIsBlockModalOpen(false)}
          onSave={handleSaveBlock}
          initialBlock={editingBlock}
        />

        {/* Dedicated Calendar Activity Edit Modal (Calendar only) */}
        <CalendarEntryModal
          isOpen={editingCalendarEntry !== null}
          entry={editingCalendarEntry}
          onClose={() => setEditingCalendarEntry(null)}
          onSave={handleSaveCalendarEntry}
        />

        {/* Supabase Connection Settings Modal */}
        <SupabaseModal
          isOpen={isSupabaseModalOpen}
          onClose={() => setIsSupabaseModalOpen(false)}
          onConfigChanged={loadInitialData}
        />
      </div>
    </DndContext>
  );
}

export default App;
