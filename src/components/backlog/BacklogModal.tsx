import React, { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Plus, Trash2, X, Check, ListTodo } from 'lucide-react';
import type { BacklogItem, BlockColor, BulletPoint } from '../../types';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BacklogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    itemData: Omit<BacklogItem, 'id' | 'createdAt' | 'updatedAt'>,
    existingId?: string
  ) => void;
  initialItem?: BacklogItem | null;
}

export const BacklogModal: React.FC<BacklogModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
}) => {
  const [title, setTitle] = useState('');
  const [tagColor, setTagColor] = useState<BlockColor>('sage');
  const [bullets, setBullets] = useState<BulletPoint[]>([]);
  const [newBulletText, setNewBulletText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setTagColor(initialItem.tagColor);
      setBullets(initialItem.bullets || []);
    } else {
      setTitle('');
      setTagColor('sage');
      setBullets([]);
    }
    setNewBulletText('');
    setError('');
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleAddBullet = () => {
    const trimmed = newBulletText.trim();
    if (!trimmed) return;
    setBullets([...bullets, { id: crypto.randomUUID(), text: trimmed, completed: false }]);
    setNewBulletText('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddBullet();
    }
  };

  const handleRemoveBullet = (id: string) => {
    setBullets(bullets.filter((b) => b.id !== id));
  };

  const handleUpdateBulletText = (id: string, text: string) => {
    setBullets(bullets.map((b) => (b.id === id ? { ...b, text } : b)));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    // Auto-commit any typed bullet point so it's not discarded on save
    const finalBullets = [...bullets];
    const pendingBullet = newBulletText.trim();
    if (pendingBullet) {
      finalBullets.push({
        id: crypto.randomUUID(),
        text: pendingBullet,
        completed: false,
      });
    }

    onSave(
      {
        title: title.trim(),
        tagColor,
        bullets: finalBullets.filter((b) => b.text.trim().length > 0),
        status: initialItem?.status || 'backlog',
        scheduledEntryId: initialItem?.scheduledEntryId,
      },
      initialItem?.id
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100F13]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#282B28] dark:text-[#EDEBF2]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE5] dark:border-[#2E2D36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5EEE6] dark:bg-[#2E2840] text-[#2D4532] dark:text-[#C5BBE3] flex items-center justify-center border border-[#CADBCB] dark:border-[#453E60]">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
                {initialItem ? 'Edit Backlog Task' : 'New Backlog Task'}
              </h2>
              <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8]">
                Tasks waiting to be scheduled into your day
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#7F867F] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#EDEBF2] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FDF2F0] dark:bg-[#3D2222] border border-[#F5C2B8] dark:border-[#6B2F2F] text-xs font-medium text-[#B05039] dark:text-[#E5735B]">
              {error}
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-[#505750] dark:text-[#C5C0D0] mb-1.5">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g., Draft Chapter 3 Methodology, LeetCode Graphs..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#D5CFC4] dark:border-[#38334E] bg-white dark:bg-[#161619] text-sm text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9] transition-all"
              autoFocus
            />
          </div>

          {/* Color Category Tags */}
          <div>
            <label className="block text-xs font-semibold text-[#505750] dark:text-[#C5C0D0] mb-1.5">
              Category Color
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['sage', 'olive', 'terracotta', 'amber'] as BlockColor[]).map((c) => {
                const scheme = COLOR_SCHEMES[c];
                const isSelected = tagColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTagColor(c)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all text-left ${
                      isSelected
                        ? `${scheme.badgeBg} ${scheme.badgeText} border-[#436249] dark:border-[#9D8EC9] ring-2 ring-[#436249]/20 dark:ring-[#9D8EC9]/30 font-semibold shadow-xs`
                        : 'bg-white dark:bg-[#161619] border-[#E0DCD4] dark:border-[#2E2D36] text-[#4A504A] dark:text-[#9E9AA8] hover:bg-[#F2EFEA] dark:hover:bg-[#25232C]'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: scheme.solid }}
                    />
                    <span className="text-xs truncate">{scheme.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bullet Points / Sub-tasks */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#505750] dark:text-[#C5C0D0]">
                Sub-tasks / Action Points
              </label>
              <span className="text-[11px] text-[#7F867F] dark:text-[#8D8898]">
                {bullets.length} {bullets.length === 1 ? 'item' : 'items'}
              </span>
            </div>

            {/* Bullets List */}
            {bullets.length > 0 && (
              <div className="space-y-2 mb-2.5 max-h-40 overflow-y-auto pr-1">
                {bullets.map((b, index) => (
                  <div key={b.id} className="flex items-center gap-2 group">
                    <span className="text-[11px] font-mono text-[#8C938C] dark:text-[#7D7988] w-4 text-right">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={b.text}
                      onChange={(e) => handleUpdateBulletText(b.id, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-lg border border-[#E0DCD4] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-xs text-[#222522] dark:text-[#EDEBF2] focus:outline-none focus:ring-1 focus:ring-[#436249] dark:focus:ring-[#9D8EC9]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(b.id)}
                      className="p-1 rounded-md text-[#888E88] dark:text-[#7D7988] hover:text-[#B05039] dark:hover:text-[#E5735B] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                      title="Remove task point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add Bullet Input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBulletText}
                onChange={(e) => setNewBulletText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a sub-task and press Enter..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#D5CFC4] dark:border-[#38334E] bg-white dark:bg-[#161619] text-xs text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30"
              />
              <button
                type="button"
                onClick={handleAddBullet}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#EFEBE5] dark:bg-[#2E2840] hover:bg-[#E5DFD6] dark:hover:bg-[#3D3654] text-xs font-semibold text-[#404540] dark:text-[#C5BBE3] transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EFEBE5] dark:border-[#2E2D36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#505750] dark:text-[#9E9AA8] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold shadow-xs hover:shadow transition-all"
            >
              {initialItem ? 'Save Changes' : 'Add to Backlog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

