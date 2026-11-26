import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiSliders } from 'react-icons/fi';
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
 * sheet with the broader topics. Scrolls sideways with a fade on the edge that has more chips.
 */
const ChipStrip = ({ label, allQuery, mine, topics, active, onSelect }: ChipStripProps) => {
  const [topicsOpen, setTopicsOpen] = useState(false);
  const [edges, setEdges] = useState({ start: false, end: false });
  const rowRef = useRef<HTMLDivElement>(null);
  const activeTopic = topics.find(([, query]) => same(query, active));

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
  }, [mine.length]);

  // Keep the active chip in view when the page opens on a focused game.
  useEffect(() => {
    rowRef.current?.querySelector<HTMLElement>('.chip.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [active]);

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
    <div className="chip-strip">
      <div className="chip-strip-bar">
        <div
          ref={rowRef}
          className={`chip-row${edges.start ? ' fade-start' : ''}${edges.end ? ' fade-end' : ''}`}
          role="group"
          aria-label={label}
        >
          {chip(['All', allQuery])}
          {mine.map(chip)}
        </div>
        <button
          type="button"
          className={`chip chip-topics${activeTopic ? ' active' : ''}`}
          aria-expanded={topicsOpen}
          aria-controls="chip-topics-sheet"
          onClick={() => setTopicsOpen((open) => !open)}
        >
          <FiSliders aria-hidden="true" />
          {activeTopic ? activeTopic[0] : 'Topics'}
          <FiChevronDown aria-hidden="true" className={topicsOpen ? 'flip' : ''} />
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
