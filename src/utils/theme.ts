import type { BlockColor } from '../types';

export interface ColorScheme {
  name: string;
  badgeBg: string;
  badgeText: string;
  cardBg: string;
  cardBorder: string;
  cardBorderHover: string;
  accentBg: string;
  bulletDot: string;
  ring: string;
  solid: string;
}

export const COLOR_SCHEMES: Record<BlockColor, ColorScheme> = {
  sage: {
    name: 'Periwinkle / Sage',
    badgeBg: 'bg-[#E5EEE6] dark:bg-[#2E2840]',
    badgeText: 'text-[#2D4532] dark:text-[#C5BBE3]',
    cardBg: 'bg-[#F6FAF6] dark:bg-[#201F24]',
    cardBorder: 'border-[#CADBCB] dark:border-[#38334E]',
    cardBorderHover: 'hover:border-[#96B89A] dark:hover:border-[#5B527E]',
    accentBg: 'bg-[#436249] dark:bg-[#9D8EC9]',
    bulletDot: 'bg-[#436249] dark:bg-[#9D8EC9]',
    ring: 'focus:ring-[#436249]/30 dark:focus:ring-[#9D8EC9]/30',
    solid: '#9D8EC9',
  },
  olive: {
    name: 'Pastel Lime / Olive',
    badgeBg: 'bg-[#EBF0D5] dark:bg-[#2E301C]',
    badgeText: 'text-[#3E4924] dark:text-[#E2EB89]',
    cardBg: 'bg-[#F7F9EE] dark:bg-[#201F24]',
    cardBorder: 'border-[#CFDBA6] dark:border-[#3E4226]',
    cardBorderHover: 'hover:border-[#A2B467] dark:hover:border-[#636A38]',
    accentBg: 'bg-[#5B6836] dark:bg-[#D8E575]',
    bulletDot: 'bg-[#5B6836] dark:bg-[#D8E575]',
    ring: 'focus:ring-[#5B6836]/30 dark:focus:ring-[#D8E575]/30',
    solid: '#D8E575',
  },
  terracotta: {
    name: 'Muted Rose / Clay',
    badgeBg: 'bg-[#F9E8E3] dark:bg-[#38262E]',
    badgeText: 'text-[#7D3220] dark:text-[#EBB5C6]',
    cardBg: 'bg-[#FAF4F2] dark:bg-[#201F24]',
    cardBorder: 'border-[#ECC5BA] dark:border-[#4B323D]',
    cardBorderHover: 'hover:border-[#D49887] dark:hover:border-[#734A5C]',
    accentBg: 'bg-[#B05039] dark:bg-[#D9859F]',
    bulletDot: 'bg-[#B05039] dark:bg-[#D9859F]',
    ring: 'focus:ring-[#B05039]/30 dark:focus:ring-[#D9859F]/30',
    solid: '#D9859F',
  },
  amber: {
    name: 'Golden Honey',
    badgeBg: 'bg-[#FAF0DE] dark:bg-[#362D20]',
    badgeText: 'text-[#7A4B13] dark:text-[#EAD0A5]',
    cardBg: 'bg-[#FAF6EF] dark:bg-[#201F24]',
    cardBorder: 'border-[#EBD4AF] dark:border-[#4A3C28]',
    cardBorderHover: 'hover:border-[#CFAB6E] dark:hover:border-[#705939]',
    accentBg: 'bg-[#B57425] dark:bg-[#DEAB6C]',
    bulletDot: 'bg-[#B57425] dark:bg-[#DEAB6C]',
    ring: 'focus:ring-[#B57425]/30 dark:focus:ring-[#DEAB6C]/30',
    solid: '#DEAB6C',
  },
};
