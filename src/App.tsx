import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchColumns, addColumn, deleteColumn, updateColumn } from './features/columns';
import ColumnItem from './components/ColumnItem';
import { PlusIcon, CheckIcon } from './components/Icons';
import Notification from './components/atoms/Notification';
import KanbanBoardView from './components/templates/KanbanBoard';

export default function KaryaBoard() {
  const dispatch = useAppDispatch();
  const { columns, loading } = useAppSelector((state) => state.columns);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'columns' | 'board'>('columns');

  console.log('🏠 App: Active tab is', activeTab);

  useEffect(() => {
    console.log('🏠 App: Fetching columns on mount');
    dispatch(fetchColumns());
  }, [dispatch]);

  const handleAddColumn = async () => {
    const result = await dispatch(addColumn('New Column'));
    if (addColumn.fulfilled.match(result)) {
      setEditingId(result.payload.id);
    }
  };

  const handleDeleteColumn = (id: string) => {
    dispatch(deleteColumn(id));
  };

  const handleUpdateColumnTitle = (id: string, newTitle: string) => {
    dispatch(updateColumn({ id, title: newTitle }));
  };

  const handleUpdatePosition = (id: string, newPosition: number) => {
    // Check if position already exists to show notification
    const positionExists = columns.some(
      (col) => col.position === newPosition && col.id !== id
    );

    if (positionExists) {
      setNotification({
        message: `Position ${newPosition} is already taken. Please resolve the duplicate to save.`,
        type: 'error'
      });
    }

    // Update the position directly to allow duplicate detection in UI
    dispatch(updateColumn({ id, position: newPosition }));
    return true;
  };

  const handleCreateBoard = () => {
    // Check for duplicate positions
    const positionMap = new Map<number, string[]>();
    columns.forEach(col => {
      const titles = positionMap.get(col.position) || [];
      titles.push(col.title);
      positionMap.set(col.position, titles);
    });

    const duplicates = Array.from(positionMap.entries())
      .filter(([_, titles]) => titles.length > 1)
      .map(([pos, titles]) => `Position ${pos}: ${titles.join(', ')}`);

    if (duplicates.length > 0) {
      setNotification({
        message: `Duplicate positions found! ${duplicates.join(' | ')}. Please fix before saving.`,
        type: 'error'
      });
      return;
    }

    // Check if any position is missing or invalid
    const invalidPositions = columns.filter(col => !col.position || col.position < 1);
    if (invalidPositions.length > 0) {
      const invalidTitles = invalidPositions.map(col => col.title).join(', ');
      setNotification({
        message: `Invalid positions in columns: ${invalidTitles}. Please ensure all positions are valid positive numbers.`,
        type: 'error'
      });
      return;
    }

    // All validations passed - show success notification (data is already saved via Redux)
    setNotification({
      message: 'Columns saved successfully!',
      type: 'success'
    });
  };

  if (loading) {
    return (
      <div className="karya-container">
        <div className="karya-content">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      <div className="karya-container">
        {/* Left Sidebar */}
        <div className="karya-sidebar">
          {/* <div className="karya-sidebar-header">
          <h2 className="karya-sidebar-title">KARYA BOARD</h2>
        </div> */}
          <nav className="karya-sidebar-nav">
            <button
              onClick={() => setActiveTab('columns')}
              className={`karya-sidebar-item ${activeTab === 'columns' ? 'active' : ''}`}
            >
              <span className="karya-sidebar-icon">⚙️</span>
              <span>Karya Board Columns</span>
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`karya-sidebar-item ${activeTab === 'board' ? 'active' : ''}`}
            >
              <span className="karya-sidebar-icon">📋</span>
              <span>Karya Board</span>
            </button>
          </nav>
        </div>


        <div className="karya-content">
          {activeTab === 'board' ? (
            <KanbanBoardView />
          ) : (
            <>
              <div style={{ width: '100%', maxWidth: '56rem', margin: '0 auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%' }}>
                  {/* Board Configuration Container */}
                  <div className="karya-board">
                    {/* Columns List */}
                    <div className="karya-columns-list">
                      {columns.map((column, index) => {
                        const columnIdNum = parseInt(column.id);
                        const isDeletable = !isNaN(columnIdNum) && columnIdNum > 8;

                        // Check for duplicate titles
                        const isDuplicate = columns.filter(c => c.title.trim().toLowerCase() === column.title.trim().toLowerCase()).length > 1;

                        // Check for duplicate positions
                        const isDuplicatePosition = columns.filter(c => c.position === column.position).length > 1;

                        return (
                          <ColumnItem
                            key={column.id}
                            column={column}
                            index={index}
                            isEditing={editingId === column.id}
                            isHovered={hoveredId === column.id}
                            isDeletable={isDeletable}
                            isDuplicate={isDuplicate}
                            isDuplicatePosition={isDuplicatePosition}
                            onEdit={setEditingId}
                            onUpdate={handleUpdateColumnTitle}
                            onUpdatePosition={handleUpdatePosition}
                            onDelete={handleDeleteColumn}
                            onHoverChange={setHoveredId}
                            onEditComplete={() => setEditingId(null)}
                          />
                        );
                      })}
                    </div>

                    {/* Add Column Button */}
                    <button onClick={handleAddColumn} className="karya-add-column-btn">
                      <PlusIcon />
                      Add Column
                    </button>

                    {/* Action Buttons */}
                    <div className="karya-actions">
                      {(() => {
                        const hasDuplicateTitles = columns.some(col => columns.filter(c => c.title.trim().toLowerCase() === col.title.trim().toLowerCase()).length > 1);
                        const hasDuplicatePositions = columns.some(col => columns.filter(c => c.position === col.position).length > 1);
                        const hasErrors = hasDuplicateTitles || hasDuplicatePositions;

                        return (
                          <button
                            onClick={handleCreateBoard}
                            className="karya-create-btn"
                            disabled={hasErrors}
                            style={{
                              opacity: hasErrors ? 0.5 : 1,
                              cursor: hasErrors ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <CheckIcon />
                            Save
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

