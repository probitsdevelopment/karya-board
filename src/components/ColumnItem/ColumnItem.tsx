import type { Column } from '../../features/columns/columnActions';
import { TrashIcon } from '../Icons';

interface ColumnItemProps {
  column: Column;
  index: number;
  isEditing: boolean;
  isHovered: boolean;
  isDeletable: boolean;
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
  onEdit,
  onUpdate,
  onUpdatePosition,
  onDelete,
  onHoverChange,
  onEditComplete,
  isDuplicate,
  isDuplicatePosition,
}: ColumnItemProps) {
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

        {/* Delete Button */}
        {isDeletable && (
          <button onClick={() => onDelete(column.id)} className="karya-delete-btn">
            <TrashIcon />
          </button>
        )}
      </div>
    </div>
  );
}
