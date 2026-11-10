import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Block, CalendarEntry, SupabaseConfig, BacklogItem } from '../types';

const SUPABASE_CONFIG_KEY = 'planner_supabase_config';
const LOCAL_BLOCKS_KEY = 'planner_local_blocks';
const LOCAL_ENTRIES_KEY = 'planner_local_entries';
const LOCAL_BACKLOG_KEY = 'planner_local_backlog';

export function getStoredSupabaseConfig(): SupabaseConfig {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  if (envUrl && envKey) {
    return { url: envUrl, anonKey: envKey, connected: true };
  }

  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, connected: true };
      }
    }
  } catch (err) {
    console.warn('Failed to parse supabase config from storage:', err);
  }

  return { url: '', anonKey: '', connected: false };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify({ url, anonKey }));
  supabaseInstance = null; // Reset cached client
}

export function clearSupabaseConfig(): void {
  localStorage.removeItem(SUPABASE_CONFIG_KEY);
  supabaseInstance = null;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  if (!config.url || !config.anonKey) {
    supabaseInstance = null;
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
    } catch (err) {
      console.error('Error creating Supabase client:', err);
      supabaseInstance = null;
    }
  }

  return supabaseInstance;
}

export async function testSupabaseConnection(url: string, key: string): Promise<boolean> {
  try {
    const client = createClient(url, key);
    const { error } = await client.from('blocks').select('id').limit(1);
    if (!error || error.code === 'PGRST116' || error.message?.includes('relation "public.blocks" does not exist')) {
      return true;
    }
    return !error;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------
// Initial Seed Data
// ---------------------------------------------------------
const INITIAL_SAMPLE_BLOCKS: Block[] = [
  {
    id: 'block-morning-focus',
    title: 'Morning Focus & Planning',
    bullets: [
      { id: 'b1', text: 'Review daily top 3 priorities', completed: false },
      { id: 'b2', text: 'Clear pending notifications & urgent messages', completed: false },
      { id: 'b3', text: 'Hydrate with warm herbal tea', completed: false },
    ],
    tagColor: 'sage',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-deep-work',
    title: 'Deep Architecture & Coding',
    bullets: [
      { id: 'b4', text: 'Modular system design & wireframes', completed: false },
      { id: 'b5', text: 'Clean state synchronization', completed: false },
      { id: 'b6', text: 'Fluid drag and drop testing', completed: false },
    ],
    tagColor: 'terracotta',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-nature-walk',
    title: 'Midday Mindful Break',
    bullets: [
      { id: 'b7', text: '30-minute outdoor fresh air walk', completed: false },
      { id: 'b8', text: 'Disconnect from digital screens', completed: false },
      { id: 'b9', text: 'Healthy light meal', completed: false },
    ],
    tagColor: 'olive',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'block-evening-reflection',
    title: 'Evening Synthesis & Wind-down',
    bullets: [
      { id: 'b10', text: 'Note key wins and learnings from the day', completed: false },
      { id: 'b11', text: 'Prepare tomorrow calendar slots', completed: false },
      { id: 'b12', text: 'Reading chapter in quiet space', completed: false },
    ],
    tagColor: 'amber',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const INITIAL_SAMPLE_ENTRIES: CalendarEntry[] = [
  {
    id: 'entry-1',
    blockId: 'block-morning-focus',
    title: 'Morning Focus & Planning',
    bullets: [
      { id: 'eb1', text: 'Review daily top 3 priorities', completed: true },
      { id: 'eb2', text: 'Clear pending notifications & urgent messages', completed: true },
      { id: 'eb3', text: 'Hydrate with warm herbal tea', completed: false },
    ],
    tagColor: 'sage',
    date: getTodayString(),
    hour: 9,
    durationMinutes: 60,
    completed: true,
  },
  {
    id: 'entry-2',
    blockId: 'block-deep-work',
    title: 'Deep Architecture & Coding',
    bullets: [
      { id: 'eb4', text: 'Modular system design & wireframes', completed: false },
      { id: 'eb5', text: 'Clean state synchronization', completed: false },
    ],
    tagColor: 'terracotta',
    date: getTodayString(),
    hour: 11,
    durationMinutes: 60,
    completed: false,
  },
];

// Helper to get local blocks from cache
function getLocalBlocksCache(): Block[] {
  try {
    const raw = localStorage.getItem(LOCAL_BLOCKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local blocks cache:', err);
  }
  return INITIAL_SAMPLE_BLOCKS;
}

// Helper to get local entries from cache
function getLocalEntriesCache(): CalendarEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_ENTRIES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local entries cache:', err);
  }
  return INITIAL_SAMPLE_ENTRIES;
}

const INITIAL_SAMPLE_BACKLOG: BacklogItem[] = [
  {
    id: 'backlog-thesis-ch3',
    title: 'Draft Chapter 3 Methodology',
    bullets: [
      { id: 'bb1', text: 'Structure data collection approach', completed: false },
      { id: 'bb2', text: 'Cite key benchmark datasets', completed: false },
    ],
    tagColor: 'olive',
    status: 'backlog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'backlog-code-review',
    title: 'Solve LeetCode Top 75 Graphs',
    bullets: [
      { id: 'bb3', text: 'BFS / DFS cycle detection', completed: false },
      { id: 'bb4', text: 'Dijkstra shortest path review', completed: false },
    ],
    tagColor: 'sage',
    status: 'backlog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'backlog-interview-prep',
    title: 'Prepare System Design Mock Interview',
    bullets: [
      { id: 'bb5', text: 'Draft rate limiter architecture diagram', completed: false },
      { id: 'bb6', text: 'Calculate QPS and cache size', completed: false },
    ],
    tagColor: 'amber',
    status: 'backlog',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getLocalBacklogCache(): BacklogItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_BACKLOG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local backlog cache:', err);
  }
  return INITIAL_SAMPLE_BACKLOG;
}

// ---------------------------------------------------------
// Storage Adapters (Online Supabase Prioritized)
// ---------------------------------------------------------

export async function fetchBlocksData(): Promise<Block[]> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('blocks')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          const blocks: Block[] = data.map((b) => ({
            id: b.id,
            title: b.title,
            bullets: b.bullets || [],
            tagColor: b.tag_color || 'sage',
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }));
          // Cache online truth locally for offline availability
          localStorage.setItem(LOCAL_BLOCKS_KEY, JSON.stringify(blocks));
          return blocks;
        } else {
          // Connected, but Supabase table is empty!
          // Push existing local blocks up to Supabase so user doesn't lose anything
          const localBlocks = getLocalBlocksCache();
          if (localBlocks.length > 0) {
            await Promise.all(
              localBlocks.map((b) =>
                client.from('blocks').upsert({
                  id: b.id,
                  title: b.title,
                  bullets: b.bullets,
                  tag_color: b.tagColor,
                  created_at: b.createdAt,
                  updated_at: b.updatedAt,
                })
              )
            );
          }
          return localBlocks;
        }
      } else if (error) {
        console.warn('Supabase fetchBlocks returned error, falling back to cache:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetchBlocks network exception:', err);
    }
  }

  // Fallback to local storage
  return getLocalBlocksCache();
}

export async function saveBlockData(block: Block): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('blocks').upsert({
        id: block.id,
        title: block.title,
        bullets: block.bullets,
        tag_color: block.tagColor,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveBlock error:', error.message, error.details);
      }
    } catch (err) {
      console.warn('Supabase saveBlock failed, updating local storage:', err);
    }
  }

  // Keep local storage in sync
  try {
    const blocks = getLocalBlocksCache();
    const idx = blocks.findIndex((b) => b.id === block.id);
    if (idx >= 0) {
      blocks[idx] = block;
    } else {
      blocks.unshift(block);
    }
    localStorage.setItem(LOCAL_BLOCKS_KEY, JSON.stringify(blocks));
  } catch (err) {
    console.error('Error saving local block:', err);
  }
}

export async function deleteBlockData(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('blocks').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteBlock error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteBlock failed:', err);
    }
  }

  try {
    const blocks = getLocalBlocksCache().filter((b) => b.id !== id);
    localStorage.setItem(LOCAL_BLOCKS_KEY, JSON.stringify(blocks));
  } catch (err) {
    console.error('Error deleting local block:', err);
  }
}

export async function fetchCalendarEntriesData(): Promise<CalendarEntry[]> {
  const client = getSupabaseClient();

  if (client) {
    try {
      const { data, error } = await client
        .from('calendar_entries')
        .select('*');

      if (!error && data) {
        if (data.length > 0) {
          const entries: CalendarEntry[] = data.map((e) => ({
            id: e.id,
            blockId: e.block_id || '',
            title: e.title,
            bullets: e.bullets || [],
            tagColor: e.tag_color || 'sage',
            date: e.date,
            hour: Number(e.hour),
            durationMinutes: Number(e.duration_minutes) || 60,
            notes: e.notes || undefined,
            completed: Boolean(e.completed),
          }));
          // Cache online truth locally
          localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(entries));
          return entries;
        } else {
          // Connected, but table has no entries yet
          const localEntries = getLocalEntriesCache();
          if (localEntries.length > 0) {
            await Promise.all(
              localEntries.map((e) =>
                client.from('calendar_entries').upsert({
                  id: e.id,
                  block_id: e.blockId || null,
                  title: e.title,
                  bullets: e.bullets,
                  tag_color: e.tagColor,
                  date: e.date,
                  hour: e.hour,
                  duration_minutes: e.durationMinutes,
                  notes: e.notes || null,
                  completed: e.completed || false,
                })
              )
            );
          }
          return localEntries;
        }
      } else if (error) {
        console.warn('Supabase fetchCalendarEntries returned error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase fetchCalendarEntries network exception:', err);
    }
  }

  // Fallback to local storage
  return getLocalEntriesCache();
}

export async function saveCalendarEntryData(entry: CalendarEntry): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('calendar_entries').upsert({
        id: entry.id,
        block_id: entry.blockId || null,
        backlog_item_id: entry.backlogItemId || null,
        title: entry.title,
        bullets: entry.bullets,
        tag_color: entry.tagColor,
        date: entry.date,
        hour: entry.hour,
        duration_minutes: entry.durationMinutes,
        notes: entry.notes || null,
        completed: entry.completed || false,
      });
      if (error) {
        console.error('Supabase saveCalendarEntry error:', error.message, error.details);
      }
    } catch (err) {
      console.warn('Supabase saveCalendarEntry failed:', err);
    }
  }

  try {
    const entries = getLocalEntriesCache();
    const idx = entries.findIndex((e) => e.id === entry.id);
    if (idx >= 0) {
      entries[idx] = entry;
    } else {
      entries.push(entry);
    }
    localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving local calendar entry:', err);
  }
}

export async function deleteCalendarEntryData(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('calendar_entries').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteCalendarEntry error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteCalendarEntry failed:', err);
    }
  }

  try {
    const entries = getLocalEntriesCache().filter((e) => e.id !== id);
    localStorage.setItem(LOCAL_ENTRIES_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Error deleting local calendar entry:', err);
  }
}

// ---------------------------------------------------------
// Backlog Items Storage
// ---------------------------------------------------------
export async function fetchBacklogData(): Promise<BacklogItem[]> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('backlog_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        if (data.length > 0) {
          const items: BacklogItem[] = data.map((b) => ({
            id: b.id,
            title: b.title,
            bullets: b.bullets || [],
            tagColor: b.tag_color || 'sage',
            status: b.status || 'backlog',
            scheduledEntryId: b.scheduled_entry_id || undefined,
            createdAt: b.created_at,
            updatedAt: b.updated_at,
          }));
          localStorage.setItem(LOCAL_BACKLOG_KEY, JSON.stringify(items));
          return items;
        } else {
          const localItems = getLocalBacklogCache();
          if (localItems.length > 0) {
            await Promise.all(
              localItems.map((item) =>
                client.from('backlog_items').upsert({
                  id: item.id,
                  title: item.title,
                  bullets: item.bullets,
                  tag_color: item.tagColor,
                  status: item.status,
                  scheduled_entry_id: item.scheduledEntryId || null,
                  created_at: item.createdAt,
                  updated_at: item.updatedAt,
                })
              )
            );
          }
          return localItems;
        }
      }
    } catch (err) {
      console.warn('Supabase fetchBacklog network exception:', err);
    }
  }

  return getLocalBacklogCache();
}

export async function saveBacklogItemData(item: BacklogItem): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('backlog_items').upsert({
        id: item.id,
        title: item.title,
        bullets: item.bullets,
        tag_color: item.tagColor,
        status: item.status,
        scheduled_entry_id: item.scheduledEntryId || null,
        updated_at: new Date().toISOString(),
      });
      if (error) {
        console.error('Supabase saveBacklogItem error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase saveBacklogItem failed:', err);
    }
  }

  try {
    const items = getLocalBacklogCache();
    const idx = items.findIndex((i) => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.unshift(item);
    }
    localStorage.setItem(LOCAL_BACKLOG_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error saving local backlog item:', err);
  }
}

export async function deleteBacklogItemData(id: string): Promise<void> {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('backlog_items').delete().eq('id', id);
      if (error) {
        console.error('Supabase deleteBacklogItem error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase deleteBacklogItem failed:', err);
    }
  }

  try {
    const items = getLocalBacklogCache().filter((i) => i.id !== id);
    localStorage.setItem(LOCAL_BACKLOG_KEY, JSON.stringify(items));
  } catch (err) {
    console.error('Error deleting local backlog item:', err);
  }
}

// ---------------------------------------------------------
// 1-Click Sync Local Data to Supabase
// ---------------------------------------------------------
export async function syncLocalToSupabase(): Promise<{
  success: boolean;
  blocksCount: number;
  entriesCount: number;
  backlogCount?: number;
  message: string;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      blocksCount: 0,
      entriesCount: 0,
      message: 'Supabase client is not connected.',
    };
  }

  try {
    const blocks = getLocalBlocksCache();
    const entries = getLocalEntriesCache();
    const backlog = getLocalBacklogCache();

    if (blocks.length > 0) {
      const { error: bErr } = await client.from('blocks').upsert(
        blocks.map((b) => ({
          id: b.id,
          title: b.title,
          bullets: b.bullets,
          tag_color: b.tagColor,
          updated_at: new Date().toISOString(),
        }))
      );
      if (bErr) throw new Error(`Blocks sync failed: ${bErr.message}`);
    }

    if (entries.length > 0) {
      const { error: eErr } = await client.from('calendar_entries').upsert(
        entries.map((e) => ({
          id: e.id,
          block_id: e.blockId || null,
          backlog_item_id: e.backlogItemId || null,
          title: e.title,
          bullets: e.bullets,
          tag_color: e.tagColor,
          date: e.date,
          hour: e.hour,
          duration_minutes: e.durationMinutes,
          notes: e.notes || null,
          completed: e.completed || false,
        }))
      );
      if (eErr) throw new Error(`Calendar entries sync failed: ${eErr.message}`);
    }

    if (backlog.length > 0) {
      const { error: kErr } = await client.from('backlog_items').upsert(
        backlog.map((item) => ({
          id: item.id,
          title: item.title,
          bullets: item.bullets,
          tag_color: item.tagColor,
          status: item.status,
          scheduled_entry_id: item.scheduledEntryId || null,
          updated_at: new Date().toISOString(),
        }))
      );
      if (kErr) throw new Error(`Backlog sync failed: ${kErr.message}`);
    }

    return {
      success: true,
      blocksCount: blocks.length,
      entriesCount: entries.length,
      backlogCount: backlog.length,
      message: `Successfully synced ${blocks.length} blocks, ${entries.length} entries, and ${backlog.length} backlog items to Supabase!`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in syncLocalToSupabase:', msg);
    return {
      success: false,
      blocksCount: 0,
      entriesCount: 0,
      message: msg,
    };
  }
}
