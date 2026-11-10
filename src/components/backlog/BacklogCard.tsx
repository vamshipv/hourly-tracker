import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  GripVertical,
  Pencil,
  Trash2,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import type { BacklogItem } from '../../types';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BacklogCardProps {
  item: BacklogItem;
  onEdit: (item: BacklogItem) => void;
  onDelete: (id: string) => void;
  onQuickSchedule: (item: BacklogItem) => void;
}

export const BacklogCard: React.FC<BacklogCardProps> = ({
  item,
  onEdit,
  onDelete,
  onQuickSchedule,
}) => {
  const [expanded, setExpanded] = useState(false);
  const scheme = COLOR_SCHEMES[item.tagColor] || COLOR_SCHEMES.sage;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `backlog-item-${item.id}`,
    data: {
      type: 'BACKLOG_ITEM',
      item,
    },
  });

  const isScheduled = item.status === 'scheduled';

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.35 : isScheduled ? 0.75 : 1,
    transition: 'opacity 200ms ease, transform 200ms ease',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-2xl border ${
        isDragging ? 'border-dashed scale-[0.99]' : ''
      } ${scheme.cardBorder} ${scheme.cardBg} ${scheme.cardBorderHover} shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden select-none`}
    >
      {/* Top Bar with Grab Handle, Tag, & Actions */}
      <div className="flex items-center justify-between p-3.5 pb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Draggable Grip Handle */}
          <button
            {...listeners}
            {...attributes}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 rounded-lg text-[#7F867F] dark:text-[#8D958D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Drag to place into calendar slot"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Color Tag Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase ${scheme.badgeBg} ${scheme.badgeText}`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: scheme.solid }}
            />
            {scheme.name}
          </span>

          {/* Scheduled Badge if item is in calendar */}
          {isScheduled && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#E2EB89]">
              <CheckCircle2 className="w-3 h-3" />
              Scheduled
            </span>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          {/* Quick Schedule Button (Single Click to assign to current/next free hour) */}
          <button
            type="button"
            onClick={() => onQuickSchedule(item)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Schedule now into current or next open hour"
          >
            <CalendarPlus className="w-3.5 h-3.5" />
          </button>

          {/* Edit Item */}
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Edit backlog task"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>

          {/* Delete Item */}
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#B05039] dark:hover:text-[#E5735B] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Delete backlog task"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Task Header & Expand Bullets Toggle */}
      <div className="px-3.5 pb-2.5 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold tracking-tight text-[#222522] dark:text-[#E5E3E0] leading-snug truncate">
          {item.title}
        </h3>
        {item.bullets && item.bullets.length > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-[#7F867F] dark:text-[#8D958D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title={expanded ? 'Collapse tasks' : 'Expand tasks'}
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>

      {/* Expandable Bullets / Sub-tasks list */}
      {expanded && item.bullets && item.bullets.length > 0 && (
        <div className="px-3.5 pb-3 pt-1 border-t border-black/5 dark:border-white/5 space-y-1.5">
          {item.bullets.map((bullet) => (
            <div
              key={bullet.id}
              className="flex items-start gap-2 text-xs text-[#4F554F] dark:text-[#C5BBE3] leading-tight"
            >
              <span
                className="w-1.5 h-1.5 rounded-full mt-1 shrink-0"
                style={{ backgroundColor: scheme.solid }}
              />
              <span className="break-words flex-1">{bullet.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

