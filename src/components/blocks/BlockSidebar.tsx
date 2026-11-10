import { useState, useMemo } from 'react';
import { Plus, Search, Filter, Layers } from 'lucide-react';
import type { Block, BlockColor } from '../../types';
import { BlockCard } from './BlockCard';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BlockSidebarProps {
  blocks: Block[];
  onAddNew: () => void;
  onEdit: (block: Block) => void;
  onDuplicate: (block: Block) => void;
  onDelete: (id: string) => void;
}

export const BlockSidebar: React.FC<BlockSidebarProps> = ({
  blocks,
  onAddNew,
  onEdit,
  onDuplicate,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<BlockColor | 'all'>('all');

  const filteredBlocks = useMemo(() => {
    return blocks.filter((block) => {
      const matchesTag = selectedTag === 'all' || block.tagColor === selectedTag;
      if (!matchesTag) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const inTitle = block.title.toLowerCase().includes(q);
      const inBullets = block.bullets.some((b) => b.text.toLowerCase().includes(q));
      return inTitle || inBullets;
    });
  }, [blocks, searchQuery, selectedTag]);

  return (
    <aside className="w-full lg:w-[30%] xl:w-[30%] h-full flex flex-col bg-white/30 dark:bg-[#161619]/35 backdrop-blur-md border-r border-white/20 dark:border-white/10 overflow-hidden select-none transition-colors">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-white/15 dark:border-white/10 bg-white/15 dark:bg-black/25 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#C5BBE3] flex items-center justify-center border border-[#CADBCB] dark:border-[#453E60]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
                Block Bank
              </h1>
              <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8]">
                {blocks.length} {blocks.length === 1 ? 'block' : 'blocks'} ready to drag
              </p>
            </div>
          </div>

          {/* Add Block button in Periwinkle for dark mode */}
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold shadow-xs hover:shadow transition-all"
            title="Create a new block"
          >
            <Plus className="w-4 h-4" />
            <span>Add Block</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-4">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#888E88] dark:text-[#7D7988]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headers or bullets..."
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-black/10 dark:border-white/10 bg-white/50 dark:bg-[#201F24]/60 text-xs text-[#222522] dark:text-[#EDEBF2] placeholder-[#7F867F] dark:placeholder-[#9E9AA8] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9] transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 mt-3 overflow-x-auto pb-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedTag('all')}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              selectedTag === 'all'
                ? 'bg-[#222522] dark:bg-[#9D8EC9] text-white dark:text-[#161619]'
                : 'bg-white/50 dark:bg-[#201F24]/60 border border-black/10 dark:border-white/10 text-[#5F665F] dark:text-[#9E9AA8] hover:bg-white/70 dark:hover:bg-[#292830]/80'
            }`}
          >
            All ({blocks.length})
          </button>

          {(['sage', 'olive', 'terracotta', 'amber'] as BlockColor[]).map((c) => {
            const count = blocks.filter((b) => b.tagColor === c).length;
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
                {scheme.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Blocks List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredBlocks.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-2xl border border-dashed border-[#DDD7CD] dark:border-[#2E2D36] bg-white/50 dark:bg-[#201F24]/40">
            <Filter className="w-6 h-6 text-[#A0A6A0] dark:text-[#7D7988] mb-2" />
            <p className="text-xs font-medium text-[#4D534D] dark:text-[#C5C0D0]">No blocks found</p>
            <p className="text-[11px] text-[#7F867F] dark:text-[#8D8898] mt-1 max-w-[200px]">
              {searchQuery || selectedTag !== 'all'
                ? 'Try clearing the search or filters.'
                : 'Click "Add Block" above to create your first block.'}
            </p>
            {blocks.length === 0 && (
              <button
                type="button"
                onClick={onAddNew}
                className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#436249] dark:bg-[#9D8EC9] text-white dark:text-[#161619] text-xs font-medium shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Block
              </button>
            )}
          </div>
        ) : (
          filteredBlocks.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </aside>
  );
};
