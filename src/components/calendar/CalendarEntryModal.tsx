import { useState, useEffect } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { Plus, Trash2, X, Pencil } from 'lucide-react';
import type { CalendarEntry, BulletPoint } from '../../types';

interface CalendarEntryModalProps {
  isOpen: boolean;
  entry: CalendarEntry | null;
  onClose: () => void;
  onSave: (updatedEntry: CalendarEntry) => void;
}

export const CalendarEntryModal: React.FC<CalendarEntryModalProps> = ({
  isOpen,
  entry,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [bullets, setBullets] = useState<BulletPoint[]>([]);
  const [newBulletText, setNewBulletText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setBullets(entry.bullets ? [...entry.bullets] : []);
    } else {
      setTitle('');
      setBullets([]);
    }
    setNewBulletText('');
    setError('');
  }, [entry, isOpen]);

  if (!isOpen || !entry) return null;

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
      setError('Please provide an activity title.');
      return;
    }

    const finalBullets = [...bullets];
    const pending = newBulletText.trim();
    if (pending) {
      finalBullets.push({ id: crypto.randomUUID(), text: pending, completed: false });
    }

    onSave({
      ...entry,
      title: title.trim(),
      bullets: finalBullets.filter((b) => b.text.trim().length > 0),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100F13]/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#282B28] dark:text-[#EDEBF2]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE5] dark:border-[#2E2D36]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EFEBE5] dark:bg-[#2E2840] text-[#3A3835] dark:text-[#C5BBE3] flex items-center justify-center border border-[#DDD8D0] dark:border-[#453E60]">
              <Pencil className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
                Edit Calendar Activity
              </h2>
              <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8]">
                Changes only apply to this calendar hour, not the block bank
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#6F756F] dark:text-[#9E9AA8] hover:text-[#222522] dark:hover:text-[#FFFFFF] hover:bg-[#EFEBE5] dark:hover:bg-[#292830] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Activity Title Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Activity Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Thesis Work or Coding Session"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-sm text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9] transition-all"
              autoFocus
            />
            {error && <p className="text-xs text-[#B05039] dark:text-[#E28399] mt-1.5">{error}</p>}
          </div>

          {/* Bullet Points Manager */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Bullet Points ({bullets.length})
            </label>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 mb-2">
              {bullets.length === 0 ? (
                <div className="p-3 text-center text-xs text-[#7F867F] dark:text-[#8D8898] bg-[#F5F2ED] dark:bg-[#161619] rounded-xl border border-dashed border-[#DDD7CD] dark:border-[#2E2D36]">
                  No bullet items yet. Add your tasks below.
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
              Update Activity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
