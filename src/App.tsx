import { useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { fetchColumns, addColumn, deleteColumn, updateColumn } from './features/columns';
import { fetchTasks } from './features/tasks';
import ColumnItem from './components/ColumnItem';
import { PlusIcon, CheckIcon } from './components/Icons';
import Notification from './components/atoms/Notification';
import KanbanBoardView from './components/templates/KanbanBoard';

export default function KaryaBoard() {
  const dispatch = useAppDispatch();
  const { columns, loading } = useAppSelector((state) => state.columns);
  const tasks = useAppSelector((state) => state.tasks?.tasks || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeTab, setActiveTab] = useState<'columns' | 'board'>('columns');
  const hasFetchedColumns = useRef(false);

  useEffect(() => {
    if (hasFetchedColumns.current) return;
    hasFetchedColumns.current = true;
    dispatch(fetchColumns() as any);
    dispatch(fetchTasks() as any);
  }, []);

  const handleAddColumn = async () => {
    const result: any = await dispatch(addColumn('New Column') as any);
    if (result && result.payload && result.payload.id) {
      setEditingId(result.payload.id);
    }
  };

  const handleDeleteColumn = (id: string, cardCount: number, columnTitle: string) => {
    // Business Rule: Only allow deletion if card count is 0
    if (cardCount > 0) {
      setNotification({
        message: 'Cards are present in the selected bucket.',
        type: 'error'
      });
      return;
    }

    // Show confirmation before deleting
    const confirmed = window.confirm(`Are you sure you want to permanently delete the column "${columnTitle}"? This action cannot be undone.`);
    if (!confirmed) return;

    dispatch(deleteColumn(id) as any);
    setNotification({
      message: `Column "${columnTitle}" deleted successfully!`,
      type: 'success'
    });
  };

  const handleUpdateColumnTitle = (id: string, newTitle: string) => {
    dispatch(updateColumn({ id, title: newTitle }) as any);
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
    dispatch(updateColumn({ id, position: newPosition }) as any);
    return true;
  };

  // Helper function to convert column title to bucket name (same as in KanbanBoard)
  const getBucketName = (columnTitle: string): string => {
    const knownMappings: Record<string, string> = {
      'TO DO': 'to-do',
      'Clients Court': 'clients-court',
      'In Training': 'in-training',
      'Archive': 'archive',
      // Optional columns (can be deleted)
      'Payments': 'payments',
    };
    return knownMappings[columnTitle] || columnTitle.toLowerCase().replace(/\s+/g, '-').trim();
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
            <KanbanBoardView key="kanban-board" />
          ) : (
            <div style={{ width: '100%', maxWidth: '56rem', margin: '0 auto', padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%' }}>
                {/* Page Header */}
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                    Karya Board Columns
                  </h1>
                  <p style={{ fontSize: '1rem', color: '#6b7280' }}>
                    Configure and manage your board columns
                  </p>
                </div>

                {/* Board Configuration Container */}
                <div className="karya-board">
                  {/* Columns List */}
                  <div className="karya-columns-list">
                    {columns.map((column, index) => {
                      const columnIdNum = parseInt(column.id);
                      // Mandatory columns: 1=TO DO, 2=Clients Court, 4=Archive, 6=In Training
                      const mandatoryIds = [1, 2, 4, 6];
                      const isDeletable = !isNaN(columnIdNum) && !mandatoryIds.includes(columnIdNum);

                      // Check for duplicate titles
                      const isDuplicate = columns.filter(c => c.title.trim().toLowerCase() === column.title.trim().toLowerCase()).length > 1;

                      // Check for duplicate positions
                      const isDuplicatePosition = columns.filter(c => c.position === column.position).length > 1;

                      // Calculate card count for this column
                      const bucketName = getBucketName(column.title);
                      const cardCount = tasks.filter((task: any) => task && task['card-bucket'] === bucketName).length;

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
                          cardCount={cardCount}
                          onEdit={setEditingId}
                          onUpdate={handleUpdateColumnTitle}
                          onUpdatePosition={handleUpdatePosition}
                          onDelete={(id) => handleDeleteColumn(id, cardCount, column.title)}
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
          )}
        </div>
      </div>
    </>
  );
}

