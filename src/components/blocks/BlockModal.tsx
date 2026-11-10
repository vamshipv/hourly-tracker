import { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Plus, Trash2, X, Check, Sparkles } from 'lucide-react';
import type { Block, BlockColor, BulletPoint } from '../../types';
import { COLOR_SCHEMES } from '../../utils/theme';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockData: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>, existingId?: string) => void;
  initialBlock?: Block | null;
}

interface TemplateOption {
  title: string;
  defaultColor: BlockColor;
}

const PRESET_TEMPLATES: TemplateOption[] = [
  { title: 'Thesis Work', defaultColor: 'olive' },
  { title: 'Coding Practice', defaultColor: 'sage' },
  { title: 'Personal Project', defaultColor: 'terracotta' },
  { title: 'Interview Preparations', defaultColor: 'amber' },
];

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialBlock,
}) => {
  const [title, setTitle] = useState('');
  const [tagColor, setTagColor] = useState<BlockColor>('sage');
  const [bullets, setBullets] = useState<BulletPoint[]>([]);
  const [newBulletText, setNewBulletText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialBlock) {
      setTitle(initialBlock.title);
      setTagColor(initialBlock.tagColor);
      setBullets(initialBlock.bullets || []);
    } else {
      setTitle('');
      setTagColor('sage');
      setBullets([]);
    }
    setNewBulletText('');
    setError('');
  }, [initialBlock, isOpen]);

  if (!isOpen) return null;

  const handleSelectTemplate = (templateTitle: string) => {
    if (!templateTitle) return;
    const found = PRESET_TEMPLATES.find((t) => t.title === templateTitle);
    if (found) {
      setTitle(found.title);
      setTagColor(found.defaultColor);
      setBullets([]);
      setError('');
    }
  };

  const handleAddBullet = () => {
    const trimmed = newBulletText.trim();
    if (!trimmed) return;
    setBullets([...bullets, { id: crypto.randomUUID(), text: trimmed }]);
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
      setError('Please provide a block title.');
      return;
    }

    const finalBullets = [...bullets];
    const pending = newBulletText.trim();
    if (pending) {
      finalBullets.push({ id: crypto.randomUUID(), text: pending });
    }

    onSave(
      {
        title: title.trim(),
        tagColor,
        bullets: finalBullets.filter((b) => b.text.trim().length > 0),
      },
      initialBlock?.id
    );
    onClose();
  };

  const colors: BlockColor[] = ['sage', 'olive', 'terracotta', 'amber'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100F13]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#282B28] dark:text-[#EDEBF2]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE5] dark:border-[#2E2D36]">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
              {initialBlock ? 'Edit Block' : 'Create New Block'}
            </h2>
            <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8] mt-0.5">
              Define the header and bullet items for this activity block
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F756F] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-[#EFEBE5] dark:hover:bg-[#292830] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Title Input & Template Dropdown Row */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8]">
                Block Header / Title
              </label>

              {/* Template Quick-Select Dropdown */}
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D8E575]" />
                <select
                  defaultValue=""
                  onChange={(e) => {
                    handleSelectTemplate(e.target.value);
                    e.target.value = '';
                  }}
                  className="text-xs font-medium bg-white dark:bg-[#161619] border border-[#DCD6CC] dark:border-[#2E2D36] text-[#363B36] dark:text-[#C5C0D0] rounded-xl px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-[#9D8EC9] cursor-pointer shadow-2xs"
                >
                  <option value="" disabled>
                    Choose template...
                  </option>
                  {PRESET_TEMPLATES.map((t) => (
                    <option key={t.title} value={t.title}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Thesis Work or Coding Practice"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-sm text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9] transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-[#B05039] dark:text-[#E28399] mt-1.5">{error}</p>}
          </div>

          {/* Color Palette Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Palette Accent Tone
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {colors.map((c) => {
                const scheme = COLOR_SCHEMES[c];
                const isSelected = tagColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setTagColor(c)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? `${scheme.badgeBg} ${scheme.badgeText} border-transparent ring-2 ${scheme.ring} font-semibold shadow-xs`
                        : 'bg-white dark:bg-[#161619] border-[#E5E0D8] dark:border-[#2E2D36] text-[#5F665F] dark:text-[#9E9AA8] hover:bg-[#F5F2ED] dark:hover:bg-[#292830]'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: scheme.solid }}
                      />
                      {scheme.name}
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bullet Points Section */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Bullet Points
            </label>

            {/* Bullets List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-2">
              {bullets.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#7F867F] dark:text-[#8D8898] bg-[#F5F2ED] dark:bg-[#161619] rounded-xl border border-dashed border-[#DDD7CD] dark:border-[#2E2D36]">
                  No bullet items yet. Type one below to add.
                </div>
              ) : (
                bullets.map((bullet, index) => (
                  <div
                    key={bullet.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-[#161619] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-xl group hover:border-[#D1C9BD] dark:hover:border-[#4B4466] transition-all"
                  >
                    <span className="text-xs text-[#7F867F] dark:text-[#7D7988] font-mono select-none w-4 text-center">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      value={bullet.text}
                      onChange={(e) => handleUpdateBulletText(bullet.id, e.target.value)}
                      placeholder="Bullet item text"
                      className="flex-1 bg-transparent text-xs text-[#282B28] dark:text-[#EDEBF2] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveBullet(bullet.id)}
                      className="text-[#9FA59F] hover:text-[#B05039] dark:hover:text-[#E28399] p-1 rounded-md opacity-70 group-hover:opacity-100 transition-colors"
                      title="Remove bullet point"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Bullet Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newBulletText}
                onChange={(e) => setNewBulletText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a bullet point and press Enter"
                className="flex-1 px-3 py-2 rounded-xl border border-[#DCD6CC] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-xs text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9]"
              />
              <button
                type="button"
                onClick={handleAddBullet}
                className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#2E2840] dark:hover:bg-[#3E3656] text-white dark:text-[#C5BBE3] text-xs font-medium transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#EFEBE5] dark:border-[#2E2D36]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#D6DAD4] dark:border-[#383545] text-xs font-medium text-[#4D534D] dark:text-[#C5C0D0] hover:bg-[#EFEBE5] dark:hover:bg-[#292830] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold tracking-wide transition-all shadow-sm"
            >
              {initialBlock ? 'Update Block' : 'Save Block'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
