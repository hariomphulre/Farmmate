/**
 * CommandPalette — Slash command dropdown for quick navigation.
 *
 * Shows when the user types "/" in the search bar.
 * Supports fuzzy matching, keyboard navigation (↑↓ Enter Esc), and grouped results.
 */
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGroupedCommands, highlightMatch } from '../../data/commandRegistry';
import './CommandPalette.css';

const CommandPalette = ({ query, isOpen, onClose, onSelectCommand, searchInputRef }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const paletteRef = useRef(null);
  const itemRefs = useRef([]);

  // Get filtered and grouped commands based on query
  const groups = useMemo(() => {
    if (!isOpen) return [];
    return getGroupedCommands(query);
  }, [query, isOpen]);

  // Flatten for keyboard navigation
  const flatCommands = useMemo(() => {
    return groups.flatMap(g => g.commands);
  }, [groups]);

  // Reset active index when results change
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (itemRefs.current[activeIndex]) {
      itemRefs.current[activeIndex].scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  // Handle command selection
  const handleSelect = useCallback((command) => {
    navigate(command.route);
    onClose();
    if (onSelectCommand) {
      onSelectCommand(command);
    }
  }, [navigate, onClose, onSelectCommand]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex(prev =>
            prev < flatCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex(prev =>
            prev > 0 ? prev - 1 : flatCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (flatCommands[activeIndex]) {
            handleSelect(flatCommands[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            setActiveIndex(prev =>
              prev > 0 ? prev - 1 : flatCommands.length - 1
            );
          } else {
            setActiveIndex(prev =>
              prev < flatCommands.length - 1 ? prev + 1 : 0
            );
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatCommands, activeIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  // Build a running flat index counter for keyboard navigation
  let flatIdx = 0;

  const strippedQuery = query.replace(/^\//, '').trim();

  return (
    <>
      {/* Backdrop to catch outside clicks */}
      <div className="cmd-palette-backdrop" onClick={onClose} />

      {/* Palette dropdown */}
      <div className="cmd-palette" ref={paletteRef} role="listbox" aria-label="Command palette">
        {/* Results */}
        {groups.length > 0 ? (
          groups.map(group => (
            <div key={group.category} className="cmd-group">
              <div className="cmd-group-label">{group.category}</div>
              {group.commands.map(cmd => {
                const currentFlatIdx = flatIdx++;
                const isActive = currentFlatIdx === activeIndex;
                const nameParts = highlightMatch(cmd.name, query);

                return (
                  <div
                    key={cmd.id}
                    ref={el => (itemRefs.current[currentFlatIdx] = el)}
                    className={`cmd-item ${isActive ? 'cmd-item--active' : ''}`}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => handleSelect(cmd)}
                    onMouseEnter={() => setActiveIndex(currentFlatIdx)}
                  >
                    <div className="cmd-item-content">
                      <div className="cmd-item-name">
                        {nameParts.map((part, i) =>
                          part.highlight
                            ? <span key={i} className="cmd-highlight">{part.text}</span>
                            : <span key={i}>{part.text}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        ) : (
          <div className="cmd-no-results">
            <div className="cmd-no-results-title">
              No commands found for "/{strippedQuery}"
            </div>
            <div className="cmd-no-results-desc">
              Try /weather, /crop, or /market
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default CommandPalette;
