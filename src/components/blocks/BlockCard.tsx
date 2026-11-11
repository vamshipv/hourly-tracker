import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Pencil, Copy, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { Block } from '../../types';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BlockCardProps {
  block: Block;
  onEdit: (block: Block) => void;
  onDuplicate: (block: Block) => void;
  onDelete: (id: string) => void;
}

export const BlockCard: React.FC<BlockCardProps> = ({
  block,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(true);
  const scheme = COLOR_SCHEMES[block.tagColor] || COLOR_SCHEMES.sage;

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `drawer-block-${block.id}`,
    data: {
      type: 'BLOCK_TEMPLATE',
      block,
    },
  });

  // Do NOT translate the original card so it stays pinned as a template in the sidebar
  const style: React.CSSProperties = {
    opacity: isDragging ? 0.35 : 1,
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
      {/* Top Header: Grab Handle, Prominent Title, Actions & Collapse Chevron */}
      <div className="flex items-start justify-between p-3.5 pb-2.5 gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Draggable Grip Handle */}
          <button
            {...listeners}
            {...attributes}
            type="button"
            className="cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg text-[#7F867F] dark:text-[#8D958D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors shrink-0"
            title="Drag to place into calendar slot"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          {/* Bigger, Prominent Title */}
          <h3 className="text-[15px] sm:text-base font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2] leading-snug break-words flex-1 min-w-0">
            {block.title}
          </h3>
        </div>

        {/* Action icons & expand/collapse toggle */}
        <div className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onDuplicate(block)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Duplicate block"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(block)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Edit block"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(block.id)}
            className="p-1.5 rounded-lg text-[#6E746E] dark:text-[#9DA49D] hover:text-[#B05039] dark:hover:text-[#E5735B] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          {block.bullets && block.bullets.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="p-1.5 rounded-lg text-[#7F867F] dark:text-[#8D958D] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Bullets List */}
      {block.bullets && block.bullets.length > 0 && expanded && (
        <div className="px-3.5 pb-3">
          <ul className="space-y-1.5">
            {block.bullets.map((bullet) => (
              <li
                key={bullet.id}
                className="flex items-start gap-2 text-xs text-[#414741] dark:text-[#C4C0BB] leading-relaxed"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${scheme.bulletDot}`}
                />
                <span className="break-words">{bullet.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Drag Hint Footer */}
      <div className="px-3.5 py-1.5 bg-black/[0.02] dark:bg-white/[0.02] border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-[#7E857E] dark:text-[#8D958D]">
        <span className="italic">Drag into any calendar hour</span>
      </div>
    </div>
  );
};
