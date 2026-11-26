import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiSliders, FiX } from 'react-icons/fi';
import type { Chip } from '../config/hubs';
import './ChipStrip.css';

interface ChipStripProps {
  /** Accessible name for the strip ("My games"). */
  label: string;
  /** Query for the combined "All" feed. */
  allQuery: string;
  mine: Chip[];
  topics: Chip[];
  active: string;
  onSelect: (query: string) => void;
}

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * One horizontal row of filters: All, then the user's games/gear, then a Topics button that opens a
 * sheet with the broader topics. An active topic or a free-text search shows as the first chip,
 * removable, so the row always says what the feed is.
 */
const ChipStrip = ({ label, allQuery, mine, topics, active, onSelect }: ChipStripProps) => {
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const rowRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const topicsButtonRef = useRef<HTMLButtonElement>(null);
  const activeTopic = topics.find(([, query]) => same(query, active));
  const isAll = same(active, allQuery);
  const inMine = mine.some(([, query]) => same(query, active));
  // Topic or free-text search: show it as a removable chip at the start of the row.
  const extraLabel = isAll || inMine ? '' : activeTopic ? activeTopic[0] : active.trim();

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return undefined;
    const update = () =>
      setEdges({
        start: row.scrollLeft > 4,
        end: row.scrollLeft + row.clientWidth < row.scrollWidth - 4,
      });
    update();
    row.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      row.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [mine.length, extraLabel]);

  // Keep the active chip in view by scrolling the row only (never the page).
  useEffect(() => {
    const row = rowRef.current;
    const chip = row?.querySelector<HTMLElement>('.chip.active');
    if (!row || !chip) return;
    const left = chip.offsetLeft - row.offsetLeft;
    if (left < row.scrollLeft || left + chip.offsetWidth > row.scrollLeft + row.clientWidth) {
      row.scrollLeft = Math.max(0, left - 16);
    }
  }, [active]);

  // Topics sheet: Escape or a click outside closes it and returns focus to the button.
  useEffect(() => {
    if (!topicsOpen) return undefined;
    const close = () => {
      setTopicsOpen(false);
      topicsButtonRef.current?.focus();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    const onPointer = (event: PointerEvent) => {
      if (!stripRef.current?.contains(event.target as Node)) setTopicsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [topicsOpen]);

  const pick = (query: string) => {
    setTopicsOpen(false);
    onSelect(query);
  };

  const chip = ([chipLabel, query]: Chip) => (
    <button
      type="button"
      key={chipLabel}
      className={`chip${same(query, active) ? ' active' : ''}`}
      aria-pressed={same(query, active)}
      onClick={() => pick(query)}
    >
      {chipLabel}
    </button>
  );

  return (
    <div className="chip-strip" ref={stripRef}>
      <div className="chip-strip-bar">
        <div
          ref={rowRef}
          className={`chip-row${edges.start ? ' fade-start' : ''}${edges.end ? ' fade-end' : ''}`}
          role="group"
          aria-label={label}
        >
          {extraLabel && (
            <button
              type="button"
              className="chip active chip-extra"
              onClick={() => pick(allQuery)}
              aria-label={`Clear ${extraLabel}, show all`}
            >
              {extraLabel}
              <FiX aria-hidden="true" />
            </button>
          )}
          {chip(['All', allQuery])}
          {mine.map(chip)}
        </div>
        <button
          ref={topicsButtonRef}
          type="button"
          className={`chip chip-topics${activeTopic ? ' has-active' : ''}`}
          aria-expanded={topicsOpen}
          aria-controls="chip-topics-sheet"
          aria-label={activeTopic ? `Topics (${activeTopic[0]} selected)` : 'Topics'}
          onClick={() => setTopicsOpen((open) => !open)}
        >
          <FiSliders aria-hidden="true" />
          <span className="chip-topics-label">Topics</span>
          <FiChevronDown aria-hidden="true" className={`chip-topics-chevron${topicsOpen ? ' flip' : ''}`} />
          {activeTopic && <span className="chip-topics-dot" aria-hidden="true" />}
        </button>
      </div>
      {topicsOpen && (
        <div className="chip-sheet" id="chip-topics-sheet" role="group" aria-label="Topics">
          {topics.map(chip)}
        </div>
      )}
    </div>
  );
};

export default ChipStrip;
