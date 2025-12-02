import { useState, useRef, useEffect } from 'react';
import type { Column } from '../../features/columns/columnActions';
import { TrashIcon } from '../Icons';

interface ColumnItemProps {
  column: Column;
  index: number;
  isEditing: boolean;
  isHovered: boolean;
  isDeletable: boolean;
  cardCount?: number;
  onEdit: (id: string) => void;
  onUpdate: (id: string, title: string) => void;
  onUpdatePosition: (id: string, position: number) => boolean | void;
  onDelete: (id: string) => void;
  onHoverChange: (id: string | null) => void;
  onEditComplete: () => void;
  isDuplicate?: boolean;
  isDuplicatePosition?: boolean;
}

export default function ColumnItem({
  column,
  index,
  isEditing,
  isHovered,
  isDeletable,
  cardCount = 0,
  onEdit,
  onUpdate,
  onUpdatePosition,
  onDelete,
  onHoverChange,
  onEditComplete,
  isDuplicate,
  isDuplicatePosition,
}: ColumnItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);
  return (
    <div
      className={`karya-column ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => onHoverChange(column.id)}
      onMouseLeave={() => onHoverChange(null)}
      style={{
        animation: `fadeInLeft 0.4s ease-out ${index * 0.05}s both`,
      }}
    >
      <div className="karya-column-content">
        {/* Position Number */}
        <div className="karya-position-wrapper">
          <input
            type="number"
            min="1"
            defaultValue={column.position}
            onChange={(e) => {
              const newPosition = parseInt(e.target.value);
              if (e.target.value === '' || isNaN(newPosition) || newPosition < 1) {
                return;
              }
              if (newPosition !== column.position) {
                onUpdatePosition(column.id, newPosition);
              }
            }}
            onBlur={(e) => {
              const newPosition = parseInt(e.target.value);
              if (e.target.value === '' || isNaN(newPosition) || newPosition < 1) {
                e.target.value = String(column.position);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            className="karya-position-input"
            style={{ borderColor: isDuplicatePosition ? '#ef4444' : undefined, color: isDuplicatePosition ? '#ef4444' : undefined }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* Column Title Input */}
        <div className="karya-column-title-wrapper">
          {isEditing ? (
            <input
              type="text"
              value={column.title}
              onChange={(e) => onUpdate(column.id, e.target.value)}
              onBlur={onEditComplete}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onEditComplete();
              }}
              className="karya-column-input"
              style={{ borderColor: isDuplicate ? '#ef4444' : undefined }}
              autoFocus
            />
          ) : (
            <div
              onClick={() => onEdit(column.id)}
              className="karya-column-title"
              style={{ color: isDuplicate ? '#ef4444' : undefined }}
            >
              {column.title}
            </div>
          )}
        </div>

        {/* Card Count Badge */}
        <div 
          style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            background: '#6366f1',
            color: 'white',
            minWidth: '40px',
            width: '40px',
            textAlign: 'center',
            flexShrink: 0,
            position: 'relative',
            cursor: 'default'
          }}
          title="Card Count"
        >
          {cardCount}
        </div>

        {/* Three Dot Menu or Spacer */}
        {isDeletable ? (
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                padding: '0.5rem',
                borderRadius: '0.5rem',
                color: '#94a3b8',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                width: '36px',
                height: '36px',
                flexShrink: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f1f5f9';
                e.currentTarget.style.color = '#475569';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#94a3b8';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="1" fill="currentColor" />
                <circle cx="12" cy="5" r="1" fill="currentColor" />
                <circle cx="12" cy="19" r="1" fill="currentColor" />
              </svg>
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                border: '1px solid #e5e7eb',
                minWidth: '150px',
                zIndex: 50,
                overflow: 'hidden'
              }}>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(column.id);
                  }}
                  disabled={cardCount > 0}
                  title={cardCount > 0 ? 'Cannot delete: Cards are present in this bucket' : 'Delete column'}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: cardCount > 0 ? '#9ca3af' : '#ef4444',
                    background: 'transparent',
                    border: 'none',
                    cursor: cardCount > 0 ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    textAlign: 'left',
                    transition: 'background 0.2s',
                    opacity: cardCount > 0 ? 0.5 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (cardCount === 0) {
                      e.currentTarget.style.background = '#fef2f2';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <TrashIcon />
                  Delete Column
                  {cardCount > 0 && (
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#dc2626', fontWeight: '600' }}>({cardCount})</span>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ width: '36px', height: '36px', flexShrink: 0 }}></div>
        )}
      </div>
    </div>
  );
}
