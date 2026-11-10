import React, { useState, useMemo } from 'react';
import {
  Plus,
  Filter,
  Layers,
  ListTodo,
  Sparkles,
} from 'lucide-react';
import type { Block, BlockColor, BacklogItem, DrawerTab } from '../../types';
import { BlockCard } from './BlockCard';
import { BacklogCard } from '../backlog/BacklogCard';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BlockSidebarProps {
  // Blocks / Templates
  blocks: Block[];
  onAddNewBlock: () => void;
  onEditBlock: (block: Block) => void;
  onDuplicateBlock: (block: Block) => void;
  onDeleteBlock: (id: string) => void;

  // Backlog Items
  backlogItems: BacklogItem[];
  onAddNewBacklog: () => void;
  onEditBacklog: (item: BacklogItem) => void;
  onDeleteBacklog: (id: string) => void;
  onQuickScheduleBacklog: (item: BacklogItem) => void;
}

export const BlockSidebar: React.FC<BlockSidebarProps> = ({
  blocks,
  onAddNewBlock,
  onEditBlock,
  onDuplicateBlock,
  onDeleteBlock,
  backlogItems,
  onAddNewBacklog,
  onEditBacklog,
  onDeleteBacklog,
  onQuickScheduleBacklog,
}) => {
  const [activeTab, setActiveTab] = useState<DrawerTab>('backlog');
  const [selectedTag, setSelectedTag] = useState<BlockColor | 'all'>('all');

  // Filtered Templates by Tag
  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      return selectedTag === 'all' || block.tagColor === selectedTag;
    });
  }, [blocks, selectedTag]);

  // Filtered Backlog Items by Tag
  const filteredBacklogItems = useMemo(() => {
    return backlogItems.filter((item) => {
      return selectedTag === 'all' || item.tagColor === selectedTag;
    });
  }, [backlogItems, selectedTag]);

  return (
    <aside className="w-full lg:w-[30%] xl:w-[30%] h-full flex flex-col bg-white/30 dark:bg-[#161619]/35 backdrop-blur-md border-r border-white/20 dark:border-white/10 overflow-hidden select-none transition-colors">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/15 dark:border-white/10 bg-white/15 dark:bg-black/25 backdrop-blur-sm">
        {/* Title and Top Action */}
        <div className="flex items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#C5BBE3] flex items-center justify-center border border-[#CADBCB] dark:border-[#453E60]">
              {activeTab === 'backlog' ? <ListTodo className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
                {activeTab === 'backlog' ? 'Task Backlog' : 'Block Bank'}
              </h1>
              <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8]">
                {activeTab === 'backlog'
                  ? `${backlogItems.length} ${backlogItems.length === 1 ? 'task' : 'tasks'} ready to schedule`
                  : `${blocks.length} ${blocks.length === 1 ? 'template' : 'templates'} ready to drag`}
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          {activeTab === 'backlog' ? (
            <button
              type="button"
              onClick={onAddNewBacklog}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold shadow-xs hover:shadow transition-all"
              title="Add a task to backlog"
            >
              <Plus className="w-4 h-4" />
              <span>New Task</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddNewBlock}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold shadow-xs hover:shadow transition-all"
              title="Create a new reusable block template"
            >
              <Plus className="w-4 h-4" />
              <span>New Block</span>
            </button>
          )}
        </div>

        {/* Tab Switcher: [ Backlog (M) ]  [ Templates (N) ] */}
        <div className="flex items-center p-1 bg-black/5 dark:bg-white/10 rounded-2xl border border-black/10 dark:border-white/10 mb-3">
          <button
            type="button"
            onClick={() => setActiveTab('backlog')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'backlog'
                ? 'bg-white dark:bg-[#201F24] text-[#222522] dark:text-[#EDEBF2] shadow-2xs'
                : 'text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2]'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5" />
            <span>Backlog</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'backlog'
                  ? 'bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#E2EB89]'
                  : 'bg-black/5 dark:bg-white/10 text-[#6E746E] dark:text-[#9E9AA8]'
              }`}
            >
              {backlogItems.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'templates'
                ? 'bg-white dark:bg-[#201F24] text-[#222522] dark:text-[#EDEBF2] shadow-2xs'
                : 'text-[#626862] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Templates</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === 'templates'
                  ? 'bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#E2EB89]'
                  : 'bg-black/5 dark:bg-white/10 text-[#6E746E] dark:text-[#9E9AA8]'
              }`}
            >
              {blocks.length}
            </span>
          </button>
        </div>

        {/* Category Tag Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 text-xs">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              selectedTag === 'all'
                ? 'bg-[#222522] dark:bg-[#9D8EC9] text-white dark:text-[#161619]'
                : 'bg-white/50 dark:bg-[#201F24]/60 border border-black/10 dark:border-white/10 text-[#5F665F] dark:text-[#9E9AA8] hover:bg-white/70 dark:hover:bg-[#292830]/80'
            }`}
          >
            All
          </button>
          {(['sage', 'olive', 'terracotta', 'amber'] as BlockColor[]).map((c) => {
            const scheme = COLOR_SCHEMES[c];
            const isSelected = selectedTag === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedTag(c)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? `${scheme.badgeBg} ${scheme.badgeText} ring-1 ${scheme.ring} font-semibold shadow-2xs`
                    : 'bg-white/50 dark:bg-[#201F24]/60 border border-black/10 dark:border-white/10 text-[#5F665F] dark:text-[#9E9AA8] hover:bg-white/70 dark:hover:bg-[#292830]/80'
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: scheme.solid }}
                />
                {scheme.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards List Section - Smooth Bottom-to-Top Animation on Tab Switch */}
      <div key={activeTab} className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'backlog' ? (
          /* Backlog List */
          filteredBacklogItems.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-black/15 dark:border-white/15 bg-white/40 dark:bg-[#201F24]/30 animate-card-slide-up">
              <Sparkles className="w-6 h-6 text-[#A0A6A0] dark:text-[#7D7988] mb-2" />
              <p className="text-xs font-semibold text-[#4D534D] dark:text-[#C5C0D0]">
                No backlog tasks found
              </p>
              <p className="text-[11px] text-[#7F867F] dark:text-[#8D8898] mt-1 max-w-[220px]">
                {selectedTag !== 'all'
                  ? 'Try clearing the category filter.'
                  : 'Click "New Task" above to add your first backlog item.'}
              </p>
              {selectedTag === 'all' && (
                <button
                  type="button"
                  onClick={onAddNewBacklog}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#436249] dark:bg-[#9D8EC9] text-white dark:text-[#161619] text-xs font-medium shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              )}
            </div>
          ) : (
            filteredBacklogItems.map((item, index) => (
              <div
                key={item.id}
                style={{ animationDelay: `${Math.min(index * 35, 220)}ms` }}
                className="animate-card-slide-up"
              >
                <BacklogCard
                  item={item}
                  onEdit={onEditBacklog}
                  onDelete={onDeleteBacklog}
                  onQuickSchedule={onQuickScheduleBacklog}
                />
              </div>
            ))
          )
        ) : (
          /* Templates List */
          filteredBlocks.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-[#DDD7CD] dark:border-[#2E2D36] bg-white/50 dark:bg-[#201F24]/40 animate-card-slide-up">
              <Filter className="w-6 h-6 text-[#A0A6A0] dark:text-[#7D7988] mb-2" />
              <p className="text-xs font-medium text-[#4D534D] dark:text-[#C5C0D0]">
                No templates found
              </p>
              <p className="text-[11px] text-[#7F867F] dark:text-[#8D8898] mt-1 max-w-[200px]">
                {selectedTag !== 'all'
                  ? 'Try clearing the category filter.'
                  : 'Click "New Block" above to create your first reusable template.'}
              </p>
              {blocks.length === 0 && (
                <button
                  type="button"
                  onClick={onAddNewBlock}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#436249] dark:bg-[#9D8EC9] text-white dark:text-[#161619] text-xs font-medium shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create Template
                </button>
              )}
            </div>
          ) : (
            filteredBlocks.map((block, index) => (
              <div
                key={block.id}
                style={{ animationDelay: `${Math.min(index * 35, 220)}ms` }}
                className="animate-card-slide-up"
              >
                <BlockCard
                  block={block}
                  onEdit={onEditBlock}
                  onDuplicate={onDuplicateBlock}
                  onDelete={onDeleteBlock}
                />
              </div>
            ))
          )
        )}
      </div>
    </aside>
  );
};
