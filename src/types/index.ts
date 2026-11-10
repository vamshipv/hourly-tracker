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

export type BacklogStatus = 'backlog' | 'scheduled' | 'completed';

export interface BacklogItem {
  id: string;
  title: string;
  bullets: BulletPoint[];
  tagColor: BlockColor;
  status: BacklogStatus;
  scheduledEntryId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DrawerTab = 'templates' | 'backlog';

export interface CalendarEntry {
  id: string;
  blockId?: string;
  backlogItemId?: string;
  title: string;
  bullets: BulletPoint[];
  tagColor: BlockColor;
  date: string; // Format: YYYY-MM-DD
  hour: number; // 0 to 23 (12:00 AM to 11:00 PM)
  durationMinutes: number;
  notes?: string;
  completed?: boolean;
}

export type CalendarViewMode = 'day' | 'week';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  connected: boolean;
}
