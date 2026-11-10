export type BlockColor = 'sage' | 'terracotta' | 'amber' | 'olive';

export interface BulletPoint {
  id: string;
  text: string;
  completed?: boolean;
}

export interface Block {
  id: string;
  title: string;
  bullets: BulletPoint[];
  tagColor: BlockColor;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEntry {
  id: string;
  blockId: string;
  title: string;
  bullets: BulletPoint[];
  tagColor: BlockColor;
  date: string; // Format: YYYY-MM-DD
  hour: number; // 8 to 21 (8:00 AM to 9:00 PM)
  durationMinutes: number; // 30, 60, 90, 120
  notes?: string;
  completed?: boolean;
}

export type CalendarViewMode = 'day' | 'week';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}
