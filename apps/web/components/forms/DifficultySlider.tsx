'use client';

import { DifficultyDistribution } from '../../types';
import { useAssignmentStore } from '../../stores/assignmentStore';
import { cn } from '../../lib/utils';

interface SliderTrack {
  key: keyof DifficultyDistribution;
  label: string;
  color: string;
  bg: string;
}

const TRACKS: SliderTrack[] = [
  { key: 'easy',   label: 'Easy',   color: 'text-emerald-400', bg: 'bg-emerald-500' },
  { key: 'medium', label: 'Medium', color: 'text-amber-400',   bg: 'bg-amber-500'   },
  { key: 'hard',   label: 'Hard',   color: 'text-rose-400',    bg: 'bg-rose-500'    },
];

export default function DifficultySlider() {
  const { difficultyDistribution, setDifficulty } = useAssignmentStore();
  const { easy, medium, hard } = difficultyDistribution;
  const total = easy + medium + hard;
  const isValid = Math.abs(total - 100) <= 1;

  const handleChange = (key: keyof DifficultyDistribution, value: number) => {
    const next = { ...difficultyDistribution, [key]: value };
    setDifficulty(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-300">Difficulty Distribution</label>
        <span
          className={cn(
            'text-xs font-semibold',
            isValid ? 'text-emerald-400' : 'text-rose-400'
          )}
        >
          {total}% {!isValid && '(must total 100%)'}
        </span>
      </div>

      {/* Visual bar */}
      <div className="flex h-3 w-full overflow-hidden rounded-full">
        <div
          className="bg-emerald-500 transition-all duration-300"
          style={{ width: `${easy}%` }}
        />
        <div
          className="bg-amber-500 transition-all duration-300"
          style={{ width: `${medium}%` }}
        />
        <div
          className="bg-rose-500 transition-all duration-300"
          style={{ width: `${hard}%` }}
        />
      </div>

      {/* Sliders */}
      <div className="space-y-3">
        {TRACKS.map(({ key, label, color, bg }) => (
          <div key={key} className="flex items-center gap-3">
            <span className={cn('w-14 text-right text-xs font-medium', color)}>
              {label}
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={difficultyDistribution[key]}
              onChange={(e) => handleChange(key, parseInt(e.target.value, 10))}
              className="flex-1 accent-brand-500 cursor-pointer"
            />
            <span className={cn('w-10 text-xs font-bold', color)}>
              {difficultyDistribution[key]}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
