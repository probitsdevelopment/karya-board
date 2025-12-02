import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { fetchColumns } from '../../../features/columns';
import { fetchTasks, reorderTaskSameColumn, moveTaskToOtherColumn, updateTaskColumn } from '../../../features/tasks';
import type { Task } from '../../../features/tasks/taskActions';
import './KanbanBoard.css';

export default function KanbanBoard() {
  const dispatch = useAppDispatch();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const columns = useAppSelector((state) => state.columns?.columns || []);
  const rawTasks = useAppSelector((state) => state.tasks?.tasks || []);

  // Initial fetch on mount - ONLY if data doesn't exist
  const hasFetched = useRef(false);

  useEffect(() => {
    // If we already have data in Redux, don't fetch again
    if (hasFetched.current || (columns.length > 0 && rawTasks.length > 0)) {
      setIsInitialLoad(false);
      return;
    }
    
    hasFetched.current = true;
    console.log('KanbanBoard: Fetching data (first time)');
    
    dispatch(fetchColumns() as any);
    dispatch(fetchTasks() as any);
    
    // Give time for initial data to load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [dispatch, columns.length, rawTasks.length]);

  /**
   * Helper function to convert column title to bucket name
   */
  const getBucketName = (columnTitle: string): string => {
    const knownMappings: Record<string, string> = {
      'Dropped': 'dropped',
      'TO DO': 'to-do',
      'Clients Court': 'clients-court',
      'In Discussion': 'in-discussion',
      'In Training': 'in-training',
      'Payments': 'payments',
      'Completed': 'completed',
      'On hold': 'on-hold',
      'Archive': 'archive',
    };

    return knownMappings[columnTitle] || columnTitle.toLowerCase().replace(/\s+/g, '-');
  };

   /* Handles both reordering within same column and moving between columns*/
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    // Dropped outside any droppable area
    if (!destination) {
      return;
    }

    // Dropped in same position
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    const taskId = draggableId;

    // CASE 1: Reordering within the same column
    if (sourceColumnId === destinationColumnId) {
      
      // Optimistic update: reorder tasks in Redux immediately
      dispatch(reorderTaskSameColumn(
        sourceColumnId,
        taskId,
        source.index,
        destination.index
      ));
 
    } 
    // CASE 2: Moving task to a different column
    else {
      
      // Optimistic update: move task in Redux immediately
      dispatch(moveTaskToOtherColumn(
        taskId,
        sourceColumnId,
        destinationColumnId,
        source.index,
        destination.index
      ));

      // Persist change to backend: update task's card-bucket
      dispatch(updateTaskColumn(taskId, destinationColumnId) as any);
    }
  };

  const sortedColumns = [...columns].sort((a, b) => a.position - b.position);

  // Helper to get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Only show loader on very first load
  if (isInitialLoad && columns.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px',
        fontWeight: '600'
      }}>
        Loading Karya Board...
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
    <div id="kanban-board-root" style={{
      width: '100%',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      boxSizing: 'border-box',
      overflow: 'auto',
      position: 'relative',
      zIndex: 10 // Ensure it sits above other content
    }}>
      {/* Header */}
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '28px', color: '#1f2937', fontWeight: 'bold' }}>
            Karya Board
          </h1>
          <p style={{ margin: '8px 0 0 0', color: '#6b7280', fontSize: '14px' }}>
            Training Requirements Management • Drag cards to reorder
          </p>
        </div>

        {/* Force Refresh Button (Subtle backup) */}
        <button
          onClick={() => {
            dispatch(fetchColumns() as any);
            dispatch(fetchTasks() as any);
          }}
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            color: '#4b5563',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: '600'
          }}
        >
          ↻ Refresh
        </button>
      </div>



      {/* Board Content */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {sortedColumns.length > 0 ? (
          sortedColumns.map((column, index) => {
            const bucketName = getBucketName(column.title);
            const columnTasks = rawTasks.filter((task: Task) => task && task['card-bucket'] === bucketName);
            
            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
            const bgColor = colors[index % colors.length];

            return (
              <Droppable droppableId={bucketName} key={column.id}>
                {(provided, snapshot) => (
              <div 
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{
                minWidth: '340px',
                maxWidth: '340px',
                background: snapshot.isDraggingOver ? '#e0e7ff' : 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: snapshot.isDraggingOver 
                  ? '0 8px 16px rgba(99, 102, 241, 0.3)' 
                  : '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'all 0.2s',
                border: snapshot.isDraggingOver 
                  ? '2px dashed #6366f1' 
                  : '2px solid transparent'
              }}>
                {/* Column Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                  paddingBottom: '12px',
                  borderBottom: `3px solid ${bgColor}`
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1f2937'
                  }}>
                    {column.title}
                  </h2>
                  <span style={{
                    background: bgColor,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {columnTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  maxHeight: 'calc(100vh - 250px)',
                  overflowY: 'auto',
                  minHeight: '100px'
                }}>
                  {columnTasks.map((task: Task, taskIndex: number) => {
                    if (!task) return null;

                    return (
                      <Draggable 
                        key={task['req-id']} 
                        draggableId={task['req-id']} 
                        index={taskIndex}
                      >
                        {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        style={{
                        ...provided.draggableProps.style,
                        background: snapshot.isDragging ? '#fef3c7' : '#f9fafb',
                        border: snapshot.isDragging 
                          ? '2px solid #f59e0b' 
                          : '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: snapshot.isDragging 
                          ? '0 8px 16px rgba(0,0,0,0.2)' 
                          : 'none',
                        userSelect: 'none'
                      }}>
                        {/* 1. Header: ID & Priority */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                            {task['req-id']}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            background: task.priority === 'Critical' ? '#fee2e2' :
                              task.priority === 'High' ? '#fed7aa' :
                                task.priority === 'Medium' ? '#fef3c7' : '#d1fae5',
                            color: task.priority === 'Critical' ? '#991b1b' :
                              task.priority === 'High' ? '#9a3412' :
                                task.priority === 'Medium' ? '#92400e' : '#065f46'
                          }}>
                            {task.priority || 'Normal'}
                          </span>
                        </div>

                        {/* 2. Title */}
                        <h3 style={{
                          margin: 0,
                          fontSize: '15px',
                          fontWeight: '600',
                          color: '#111827',
                          lineHeight: '1.4'
                        }}>
                          {task['training-title'] || 'Untitled Task'}
                        </h3>

                        {/* 3. Client & Mode */}
                        <div style={{ fontSize: '13px', color: '#4b5563' }}>
                          <span style={{ fontWeight: '600' }}>{task['client-name'] || 'Unknown'}</span>
                          <span style={{ margin: '0 6px', color: '#d1d5db' }}>|</span>
                          <span>{task['mode-of-training'] || 'N/A'}</span>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', background: '#e5e7eb' }}></div>

                        {/* 4. Trainers & Stats */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span title="AI Trainers">🤖 {task['trainers-selected']?.ai || 0}</span>
                            <span title="Manual Trainers">👨‍🏫 {task['trainers-selected']?.manual || 0}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <span title="Comments">💬 {task.comments || 0}</span>
                            <span title="Attachments">📎 {task['attached-docs'] || 0}</span>
                          </div>
                        </div>

                        {/* 5. Assigned To & Probability */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: '#3b82f6',
                              color: 'white',
                              fontSize: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 'bold'
                            }}>
                              {getInitials(task['assigned-to'] || '?')}
                            </div>
                            <span style={{ fontSize: '12px', color: '#374151' }}>
                              {task['assigned-to'] || 'Unassigned'}
                            </span>
                          </div>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '600',
                            color: (task.probability || 0) > 70 ? '#059669' : (task.probability || 0) > 40 ? '#d97706' : '#dc2626'
                          }}>
                            {task.probability || 0}% Prob.
                          </div>
                        </div>

                        {/* 6. Dates Footer */}
                        <div style={{
                          background: '#f3f4f6',
                          margin: '0 -12px -12px -12px',
                          padding: '8px 12px',
                          borderBottomLeftRadius: '8px',
                          borderBottomRightRadius: '8px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: '#6b7280'
                        }}>
                          <span>Created: {formatDate(task['requiremnet-created'])}</span>
                          <span style={{ fontWeight: '600', color: '#4b5563' }}>Due: {formatDate(task['due-date'])}</span>
                        </div>
                        {/* Task Content */}
                      </div>
                        )}
                      </Draggable>
                    );
                  })}

                  {provided.placeholder}

                  {columnTasks.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#9ca3af',
                      fontSize: '14px',
                      border: '2px dashed #d1d5db',
                      borderRadius: '8px',
                      background: snapshot.isDraggingOver ? '#f0f9ff' : 'transparent'
                    }}>
                      {snapshot.isDraggingOver ? 'Drop here' : 'No tasks'}
                    </div>
                  )}
                </div>
              </div>
                )}
              </Droppable>
            );
          })
        ) : (
          <div style={{
            width: '100%',
            textAlign: 'center',
            color: 'white',
            fontSize: '18px',
            paddingTop: '40px'
          }}>
            No columns found.
          </div>
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
    </DragDropContext>
  );
}
