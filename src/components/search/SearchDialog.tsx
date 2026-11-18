import { useCallback, useEffect, useRef, useState } from "react";
import { CornerDownLeftIcon, FileTextIcon, FolderKanbanIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLenisLock } from "@/hooks/use-lenis-lock";
import { cn } from "@/lib/utils";

/* Minimal typings for the Pagefind JS API we use */
type PagefindResultData = {
  url: string;
  excerpt: string;
  meta: { title?: string; image?: string; image_alt?: string };
  filters: Record<string, string[]>;
};
type Pagefind = {
  options: (o: Record<string, unknown>) => Promise<void>;
  init: () => Promise<void>;
  debouncedSearch: (
    q: string,
    o?: { filters?: Record<string, string> },
    ms?: number,
  ) => Promise<{ results: { id: string; data: () => Promise<PagefindResultData> }[] } | null>;
};

type Result = PagefindResultData & { id: string };

/** Values must match `data-pagefind-filter="type:…"` in EntryLayout. */
const FILTERS = [
  { label: "All", value: "" },
  { label: "Blog", value: "Blog" },
  { label: "Projects", value: "Project" },
];

let pagefindPromise: Promise<Pagefind> | null = null;
function loadPagefind() {
  pagefindPromise ??= (async () => {
    const url = "/pagefind/pagefind.js";
    const pf: Pagefind = await import(/* @vite-ignore */ url);
    await pf.options({ excerptLength: 22 });
    await pf.init();
    return pf;
  })().catch((err) => {
    pagefindPromise = null;
    throw err;
  });
  return pagefindPromise;
}

export default function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  useLenisLock(open);

  /* Global shortcuts + any element with [data-open-search] */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target as HTMLElement)?.tagName) ||
        (e.target as HTMLElement)?.isContentEditable;
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !typing)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("[data-open-search]")) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("click", onClick);
    };
  }, []);

  /* Load the index the first time the dialog opens */
  useEffect(() => {
    if (!open || status !== "idle") return;
    setStatus("loading");
    loadPagefind()
      .then(() => setStatus("ready"))
      .catch(() => setStatus("unavailable"));
  }, [open, status]);

  /* Run the search */
  useEffect(() => {
    if (status !== "ready") return;
    if (!query.trim()) {
      setResults([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const pf = await loadPagefind();
      const search = await pf.debouncedSearch(query, filter ? { filters: { type: filter } } : {}, 200);
      if (!search || cancelled) return;
      const data = await Promise.all(
        search.results.slice(0, 8).map(async (r) => ({ id: r.id, ...(await r.data()) })),
      );
      if (!cancelled) {
        setResults(data);
        setActive(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [query, filter, status]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const onInputKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!results.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => (i + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => (i - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        window.location.href = results[active].url;
      }
    },
    [results, active],
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setOpen(true)} className="md:hidden">
        <SearchIcon />
      </Button>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-8 w-40 justify-between rounded-full pr-1.5 pl-3 font-normal text-muted-foreground md:inline-flex xl:w-52"
      >
        <span className="flex items-center gap-2">
          <SearchIcon />
          Search…
        </span>
        <kbd className="pointer-events-none rounded-full border bg-muted px-2 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </Button>

      <DialogContent
        showCloseButton={false}
        className="top-[10vh] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <DialogTitle className="sr-only">Search the site</DialogTitle>
        <DialogDescription className="sr-only">Search blog posts and projects</DialogDescription>

        <div className="flex items-center gap-2 border-b px-4">
          <SearchIcon className="size-4 shrink-0 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search posts and projects…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search query"
            aria-controls="search-results"
          />
          {status === "loading" && <LoaderCircleIcon className="size-4 animate-spin text-muted-foreground" />}
        </div>

        <div className="flex gap-1 border-b px-3 py-2" role="tablist" aria-label="Filter results">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              role="tab"
              aria-selected={filter === f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                filter === f.value && "bg-primary text-primary-foreground hover:text-primary-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-[60vh] overflow-y-auto overscroll-contain" data-lenis-prevent>
          {status === "unavailable" ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              The search index hasn't been built yet. Run <code className="rounded bg-muted px-1">npm run build</code>{" "}
              (or <code className="rounded bg-muted px-1">npm run search:dev</code> during development).
            </p>
          ) : !query.trim() ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              Type to search across every blog post and project.
            </p>
          ) : results.length === 0 && status === "ready" ? (
            <p className="px-6 py-10 text-center text-sm text-muted-foreground">
              No results for “<span className="text-foreground">{query}</span>”.
            </p>
          ) : (
            <ul id="search-results" ref={listRef} className="p-2" role="listbox">
              {results.map((r, i) => {
                const isProject = r.filters.type?.includes("Project");
                const Icon = isProject ? FolderKanbanIcon : FileTextIcon;
                return (
                  <li key={r.id} role="option" aria-selected={i === active} data-index={i}>
                    <a
                      href={r.url}
                      onMouseEnter={() => setActive(i)}
                      className={cn(
                        "flex gap-3 rounded-lg p-3 transition-colors",
                        i === active && "bg-accent text-accent-foreground",
                      )}
                    >
                      {r.meta.image ? (
                        <img
                          src={r.meta.image}
                          alt=""
                          loading="lazy"
                          className="size-12 shrink-0 rounded-md object-cover ring-1 ring-foreground/10"
                        />
                      ) : (
                        <span className="grid size-12 shrink-0 place-items-center rounded-md bg-muted">
                          <Icon className="size-5 text-muted-foreground" />
                        </span>
                      )}
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate font-medium">{r.meta.title}</span>
                          <span className="shrink-0 rounded-full border px-1.5 text-[10px] text-muted-foreground">
                            {isProject ? "Project" : "Blog"}
                          </span>
                        </span>
                        <span
                          className="mt-0.5 line-clamp-2 text-xs text-muted-foreground [&_mark]:rounded-sm [&_mark]:bg-primary/20 [&_mark]:px-0.5 [&_mark]:text-foreground"
                          dangerouslySetInnerHTML={{ __html: r.excerpt }}
                        />
                      </span>
                      {i === active && <CornerDownLeftIcon className="size-4 shrink-0 self-center opacity-60" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex gap-3">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </span>
          <span>Powered by Pagefind</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
