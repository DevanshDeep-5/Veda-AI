'use client';

import { cn } from '../../lib/utils';
import { Difficulty } from '../../types';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const CONFIG: Record<Difficulty, { label: string; classes: string }> = {
  easy:   { label: 'Easy',   classes: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  medium: { label: 'Medium', classes: 'bg-amber-500/15 text-amber-400 border-amber-500/30'     },
  hard:   { label: 'Hard',   classes: 'bg-rose-500/15 text-rose-400 border-rose-500/30'         },
};

export default function DifficultyBadge({ difficulty, className }: DifficultyBadgeProps) {
  const { label, classes } = CONFIG[difficulty];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide',
        classes,
        className
      )}
    >
      {label}
    </span>
  );
}
