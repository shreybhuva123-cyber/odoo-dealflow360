import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/theme.store';
import { cn } from '@/lib/utils';

type Theme = 'light' | 'dark' | 'system';

const options: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light', icon: <Sun className="w-3.5 h-3.5" />, label: 'Light' },
  { value: 'dark', icon: <Moon className="w-3.5 h-3.5" />, label: 'Dark' },
  { value: 'system', icon: <Monitor className="w-3.5 h-3.5" />, label: 'System' },
];

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-muted/50 border border-border/50">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setTheme(opt.value)}
          title={`${opt.label} theme`}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-md transition-all duration-200',
            theme === opt.value
              ? 'bg-background text-foreground shadow-sm border border-border/50'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          )}
        >
          {opt.icon}
        </button>
      ))}
    </div>
  );
}
