import { useEffect, useRef, useState } from "react";
import { CheckIcon, MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { palettes, themeDefaults, type PaletteId, type ThemeMode } from "@/config/theme";
import { getMode, getPalette, setMode, setPalette, watchSystemTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const modes: { value: ThemeMode; label: string; Icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", Icon: SunIcon },
  { value: "dark", label: "Dark", Icon: MoonIcon },
  { value: "system", label: "System", Icon: MonitorIcon },
];

export default function ThemeSwitcher({ className }: { className?: string }) {
  const [mode, setModeState] = useState<ThemeMode>(themeDefaults.mode);
  const [palette, setPaletteState] = useState<PaletteId>(themeDefaults.palette);
  const origin = useRef<{ x: number; y: number } | undefined>(undefined);

  useEffect(() => {
    setModeState(getMode());
    setPaletteState(getPalette());
    watchSystemTheme();
  }, []);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Change theme"
            className={cn("relative", className)}
            onPointerDown={(e) => (origin.current = { x: e.clientX, y: e.clientY })}
          />
        }
      >
        <SunIcon className="scale-100 rotate-0 transition-transform duration-500 dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="absolute scale-0 rotate-90 transition-transform duration-500 dark:scale-100 dark:rotate-0" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Mode</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={mode}
            onValueChange={(value) => {
              setModeState(value as ThemeMode);
              setMode(value as ThemeMode, origin.current);
            }}
          >
            {modes.map(({ value, label, Icon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <Icon />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Palette</DropdownMenuLabel>
          <div className="grid grid-cols-3 gap-1.5 p-1.5" role="radiogroup" aria-label="Colour palette">
            {palettes.map((p) => {
              const active = p.id === palette;
              return (
                <button
                  key={p.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={(e) => {
                    setPaletteState(p.id);
                    setPalette(p.id, { x: e.clientX, y: e.clientY });
                  }}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md p-1.5 text-[11px] text-muted-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                    active && "bg-accent text-accent-foreground",
                  )}
                >
                  <span
                    className="grid size-6 place-items-center rounded-full ring-1 ring-foreground/10"
                    style={{ background: p.swatch }}
                  >
                    {active && <CheckIcon className="size-3.5 text-white" />}
                  </span>
                  {p.label}
                </button>
              );
            })}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
