import { useState } from 'react';
import { Database, X, Check, Copy, AlertCircle, RefreshCw, UploadCloud } from 'lucide-react';
import {
  getStoredSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  testSupabaseConnection,
  syncLocalToSupabase,
} from '../../services/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

const SQL_SCHEMA = `-- Copy & paste into Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS public.blocks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag_color TEXT NOT NULL DEFAULT 'sage',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.calendar_entries (
  id TEXT PRIMARY KEY,
  block_id TEXT,
  title TEXT NOT NULL,
  bullets JSONB NOT NULL DEFAULT '[]'::jsonb,
  tag_color TEXT NOT NULL DEFAULT 'sage',
  date DATE NOT NULL,
  hour INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  notes TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all to blocks" ON public.blocks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all to entries" ON public.calendar_entries FOR ALL USING (true) WITH CHECK (true);`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  onConfigChanged,
}) => {
  const currentConfig = getStoredSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Please provide both URL and Anon key.' });
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    const ok = await testSupabaseConnection(url.trim(), anonKey.trim());
    setIsTesting(false);
    if (ok) {
      setTestResult({ success: true, message: 'Connected successfully to Supabase!' });
    } else {
      setTestResult({
        success: false,
        message: 'Could not connect. Please check URL, key, and network.',
      });
    }
  };

  const handleSave = () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both URL and Anon key.' });
      return;
    }
    saveSupabaseConfig(url.trim(), anonKey.trim());
    onConfigChanged();
    onClose();
  };

  const handleDisconnect = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult(null);
    setSyncStatus(null);
    onConfigChanged();
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    setSyncStatus(null);
    const result = await syncLocalToSupabase();
    setIsSyncing(false);
    setSyncStatus(result.message);
    if (result.success) {
      onConfigChanged();
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#100F13]/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#FAF8F5] dark:bg-[#201F24] border border-[#E5E0D8] dark:border-[#2E2D36] rounded-3xl shadow-2xl p-6 sm:p-7 overflow-hidden text-[#282B28] dark:text-[#EDEBF2]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#EFEBE5] dark:border-[#2E2D36]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#EFEBE5] dark:bg-[#2E2840] text-[#3A3835] dark:text-[#C5BBE3] flex items-center justify-center border border-[#DDD8D0] dark:border-[#453E60]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-[#222522] dark:text-[#EDEBF2]">
                Supabase Backend Sync
              </h2>
              <p className="text-xs text-[#6F756F] dark:text-[#9E9AA8]">
                Cloud persistence for your blocks and calendar entries
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

        <div className="mt-5 space-y-4">
          {/* Status banner */}
          <div className="p-3 rounded-2xl bg-[#F4EFEA] dark:bg-[#161619] border border-[#E6E0D6] dark:border-[#2E2D36] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  currentConfig.connected ? 'bg-[#436249] dark:bg-[#D8E575]' : 'bg-[#C07D2B]'
                }`}
              />
              <span className="font-medium text-[#3A403A] dark:text-[#C5C0D0]">
                {currentConfig.connected
                  ? 'Currently active: Connected to Supabase'
                  : 'Currently active: Browser Local Storage (Offline Mode)'}
              </span>
            </div>
            {currentConfig.connected && (
              <button
                type="button"
                onClick={handleDisconnect}
                className="text-[11px] font-medium text-[#B05039] dark:text-[#E28399] hover:underline"
              >
                Disconnect
              </button>
            )}
          </div>

          {/* Project URL */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Project URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-project.supabase.co"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-xs text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9]"
            />
          </div>

          {/* Anon Public Key */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#5F665F] dark:text-[#9E9AA8] mb-1.5">
              Anon Public API Key
            </label>
            <input
              type="password"
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCD6CC] dark:border-[#2E2D36] bg-white dark:bg-[#161619] text-xs text-[#222522] dark:text-[#EDEBF2] placeholder-[#A0A6A0] dark:placeholder-[#7D7988] focus:outline-none focus:ring-2 focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30 focus:border-[#436249] dark:focus:border-[#9D8EC9]"
            />
          </div>

          {/* Test feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#EFEBE5] dark:bg-[#2E2840] border-[#DDD8D0] dark:border-[#453E60] text-[#2D2B28] dark:text-[#EDEBF2]'
                  : 'bg-[#F9E8E3] dark:bg-[#38262E] border-[#ECC5BA] dark:border-[#4B323D] text-[#7D3220] dark:text-[#EBB5C6]'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Sync Local Data to Supabase Button */}
          {currentConfig.connected && (
            <div className="p-3 rounded-2xl border border-[#D6DAD4] dark:border-[#2E2D36] bg-white dark:bg-[#161619] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-[#222522] dark:text-[#EDEBF2]">
                    Upload Local Data to Supabase
                  </div>
                  <div className="text-[11px] text-[#78746F]">
                    Push all existing local blocks & calendar entries to your cloud database
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#2E2840] dark:hover:bg-[#3E3656] text-white dark:text-[#C5BBE3] text-xs font-medium shadow-xs disabled:opacity-50"
                >
                  <UploadCloud className={`w-3.5 h-3.5 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              </div>
              {syncStatus && (
                <p className="text-xs text-[#436249] dark:text-[#D8E575] font-medium pt-1">
                  {syncStatus}
                </p>
              )}
            </div>
          )}

          {/* SQL Helper Box */}
          <div className="pt-2">
            <div className="flex items-center justify-between pb-1 text-xs font-medium text-[#656C65] dark:text-[#9E9AA8]">
              <span>SQL Table Setup</span>
              <button
                type="button"
                onClick={handleCopySql}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#436249] dark:text-[#D8E575] hover:underline"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3 h-3" />
                    Copied SQL!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy SQL Script
                  </>
                )}
              </button>
            </div>
            <pre className="p-2.5 rounded-xl bg-white dark:bg-[#161619] border border-[#E5E0D8] dark:border-[#2E2D36] text-[10px] font-mono text-[#5A605A] dark:text-[#9E9AA8] max-h-24 overflow-y-auto">
              {SQL_SCHEMA}
            </pre>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-[#EFEBE5] dark:border-[#2E2D36]">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#D6DAD4] dark:border-[#383545] bg-white dark:bg-[#161619] hover:bg-[#F2EFEA] dark:hover:bg-[#292830] text-xs font-medium text-[#383E38] dark:text-[#C5C0D0] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#D6DAD4] dark:border-[#383545] text-xs font-medium text-[#4D534D] dark:text-[#C5C0D0] hover:bg-[#EFEBE5] dark:hover:bg-[#292830] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 rounded-xl bg-[#436249] hover:bg-[#344E39] dark:bg-[#9D8EC9] dark:hover:bg-[#ABA0D4] text-white dark:text-[#161619] text-xs font-semibold shadow-xs transition-all"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
