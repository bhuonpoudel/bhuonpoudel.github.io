import { useState } from "react";
import { ArrowUpRightIcon, DownloadIcon, MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useLenisLock } from "@/hooks/use-lenis-lock";
import type { NavItem } from "@/config/site";
import { cn } from "@/lib/utils";

interface Props {
  items: NavItem[];
  currentPath: string;
  resume?: string;
}

export default function MobileNav({ items, currentPath, resume }: Props) {
  const [open, setOpen] = useState(false);
  useLenisLock(open);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" aria-label="Open menu" className="md:hidden" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="right" className="w-[85vw] max-w-sm">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col px-2" aria-label="Mobile">
          <a
            href="/"
            className={cn(
              "rounded-lg px-3 py-3 text-2xl font-display transition-colors hover:bg-accent",
              currentPath === "/" && "text-primary",
            )}
          >
            Home
          </a>
          {items.map((item) => {
            const active = currentPath.startsWith(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex items-center justify-between rounded-lg px-3 py-3 text-2xl font-display transition-colors hover:bg-accent",
                  active && "text-primary",
                )}
              >
                {item.label}
                <ArrowUpRightIcon className="size-5 opacity-0 transition-opacity group-hover:opacity-60" />
              </a>
            );
          })}
        </nav>
        {resume && (
          <div className="mt-auto p-4">
            <Button className="w-full" size="lg" nativeButton={false} render={<a href={resume} download />}>
              <DownloadIcon data-icon="inline-start" />
              Download CV
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
