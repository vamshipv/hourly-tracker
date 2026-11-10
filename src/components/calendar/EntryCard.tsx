import React, { useState } from 'react';
import { Trash2, Pencil, ChevronDown, ChevronUp } from 'lucide-react';
import type { CalendarEntry } from '../../types';
import { COLOR_SCHEMES } from '../../utils/theme';

interface EntryCardProps {
  entry: CalendarEntry;
  onDelete: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  onToggleBullet: (entryId: string, bulletId: string) => void;
  onEdit?: (entry: CalendarEntry) => void;
  compact?: boolean;
}

interface StrikeTextProps {
  text: string;
  completed: boolean;
  className?: string;
}

const StrikeText: React.FC<StrikeTextProps> = ({ text, completed, className = '' }) => {
  return (
    <div className={`min-w-0 ${className}`}>
      {/* Strict inline wrapper so the line matches the text length exactly */}
      <span className="relative inline">
        <span
          className={`transition-colors duration-300 break-words ${
            completed ? 'text-[#555B55] dark:text-[#ABA4B8]' : ''
          }`}
        >
          {text}
        </span>
        {/* Human hand-drawn straight strike line - strictly bound to text characters */}
        <span
          aria-hidden="true"
          className={`absolute left-0 top-[52%] -translate-y-1/2 h-[1.25px] bg-[#6B726B] dark:bg-[#ABA0D4] transition-all duration-350 ease-out origin-left pointer-events-none rounded-full ${
            completed ? 'w-full opacity-75 scale-x-100' : 'w-0 opacity-0 scale-x-0'
          }`}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          }}
        />
      </span>
    </div>
  );
};

export const EntryCard: React.FC<EntryCardProps> = ({
  entry,
  onDelete,
  onToggleBullet,
  onEdit,
  compact = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [hoveredTarget, setHoveredTarget] = useState<'title' | string | null>(null);

  const scheme = COLOR_SCHEMES[entry.tagColor] || COLOR_SCHEMES.sage;
  const completedBulletsCount = (entry.bullets || []).filter((b) => b.completed).length;
  const totalBullets = (entry.bullets || []).length;
  const allBulletsDone = totalBullets > 0 && completedBulletsCount === totalBullets;

  const isTitleHovered = hoveredTarget === 'title';
  const hasActiveHover = hoveredTarget !== null;

  return (
    <div
      className={`relative rounded-2xl border ${scheme.cardBorder} ${scheme.cardBg} shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden text-[#222522] dark:text-[#EDEBF2]`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between p-3 pb-2 gap-2">
        <div
          onMouseEnter={() => setHoveredTarget('title')}
          onMouseLeave={() => setHoveredTarget(null)}
          className={`flex items-center gap-2 min-w-0 flex-1 p-1 rounded-xl transition-all duration-200 ${
            isTitleHovered
              ? 'translate-x-1 bg-black/[0.025] dark:bg-white/[0.04]'
              : hasActiveHover
              ? 'filter blur-[0.4px] opacity-75'
              : ''
          }`}
        >
          {/* Tag Color Dot Indicator */}
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: scheme.solid }}
          />

          {/* Clean, Always-Readable Title (no strikethrough, no checkpoint) */}
          <h4 className="font-semibold tracking-tight text-xs sm:text-sm select-none text-[#222522] dark:text-[#EDEBF2] truncate">
            {entry.title}
          </h4>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          {/* All Done Badge */}
          {allBulletsDone && (
            <span className="text-[10px] font-semibold text-[#436249] dark:text-[#D8E575] bg-[#E5EEE6] dark:bg-[#2E2840] px-1.5 py-0.5 rounded-md select-none mr-1">
              Done
            </span>
          )}

          {/* Edit Activity Button (Calendar Entry scope only) */}
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(entry)}
              className="p-1.5 rounded-lg text-[#7F867F] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              title="Edit bullet points for this calendar entry"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Remove Entry Button */}
          <button
            type="button"
            onClick={() => onDelete(entry.id)}
            className="p-1.5 rounded-lg text-[#888E88] dark:text-[#7D7988] hover:text-[#B05039] dark:hover:text-[#E28399] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            title="Remove from calendar"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bullets List */}
      {entry.bullets && entry.bullets.length > 0 && (
        <div
          className={`px-3 pb-3 transition-all duration-200 ${
            isTitleHovered ? 'filter blur-[0.4px] opacity-75' : ''
          }`}
        >
          {compact ? (
            <div className="flex items-center justify-between text-[11px] text-[#656C65] dark:text-[#9E9AA8] pt-1">
              <span>
                {completedBulletsCount}/{totalBullets} done
              </span>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[#656C65] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2] p-0.5"
              >
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          ) : null}

          {isExpanded && (
            <ul className="space-y-1 mt-1">
              {entry.bullets.map((b) => {
                const isThisBulletHovered = hoveredTarget === b.id;
                const isOtherElementHovered = hasActiveHover && !isThisBulletHovered;

                return (
                  <li
                    key={b.id}
                    onMouseEnter={() => setHoveredTarget(b.id)}
                    onMouseLeave={() => setHoveredTarget(null)}
                    onClick={() => onToggleBullet(entry.id, b.id)}
                    className={`flex items-start gap-2 text-xs text-[#3E443E] dark:text-[#C5C0D0] hover:text-[#222522] dark:hover:text-[#EDEBF2] cursor-pointer group select-none leading-tight p-1 rounded-lg transition-all duration-200 ${
                      isThisBulletHovered
                        ? 'translate-x-1 bg-black/[0.025] dark:bg-white/[0.04]'
                        : isOtherElementHovered
                        ? 'filter blur-[0.4px] opacity-75'
                        : ''
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        b.completed
                          ? 'bg-[#436249] dark:bg-[#D8E575] border-[#436249] dark:border-[#D8E575] text-white dark:text-[#161619]'
                          : 'border-[#CAD2C8] dark:border-[#3E3B4B] bg-white dark:bg-[#201F24] group-hover:border-[#436249] dark:group-hover:border-[#9D8EC9]'
                      }`}
                    >
                      {b.completed && (
                        <span className="w-1.5 h-1.5 bg-white dark:bg-[#161619] rounded-xs" />
                      )}
                    </span>
                    <StrikeText
                      text={b.text}
                      completed={Boolean(b.completed)}
                      className="flex-1"
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
