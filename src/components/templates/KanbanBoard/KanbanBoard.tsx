import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { fetchColumns } from '../../../features/columns';
import { fetchTasks } from '../../../features/tasks';
import type { Task } from '../../../features/tasks/tasksSlice';
import './KanbanBoard.css';

export default function KanbanBoard() {
  const dispatch = useAppDispatch();
  const hasFetched = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const columnsState = useAppSelector((state) => state.columns);
  const tasksState = useAppSelector((state) => state.tasks);

  const columns = columnsState?.columns || [];
  const columnsLoading = columnsState?.loading || false;
  const rawTasks = tasksState?.tasks || [];
  const tasksLoading = tasksState?.loading || false;

  // Smart Automatic Fetch
  useEffect(() => {
    // Small timeout to allow initial render
    const timer = setTimeout(() => {
      setIsReady(true);

      if (!hasFetched.current) {
        hasFetched.current = true;

        // Only fetch if we don't have data yet
        if (columns.length === 0) {
          console.log('KB: Fetching columns...');
          dispatch(fetchColumns());
        }

        if (rawTasks.length === 0) {
          console.log('KB: Fetching tasks...');
          dispatch(fetchTasks());
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [dispatch, columns.length, rawTasks.length]);

  const columnBucketMap: Record<string, string> = {
    'TO DO': 'todo',
    'Clients Court': 'in-client',
    'In Discussion': 'in-discussion',
    'In Training': 'at-training',
    'Payments': 'payment',
    'Completed': 'completed',
    'On hold': 'on-hold',
    'Archive': 'archived',
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

  // Initial render safety
  if (!isReady) {
    return (
      <div style={{
        width: '100%',
        height: '100vh',
        background: '#667eea',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white'
      }}>
        Initializing Board...
      </div>
    );
  }

  return (
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
            Training Requirements Management
          </p>
        </div>

        {/* Force Refresh Button (Subtle backup) */}
        <button
          onClick={() => {
            dispatch(fetchColumns());
            dispatch(fetchTasks());
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

      {/* Loading State */}
      {(columnsLoading || tasksLoading) && (
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'inline-block',
            width: '50px',
            height: '50px',
            border: '5px solid #f3f4f6',
            borderTopColor: '#667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '16px', color: '#6b7280' }}>Loading Data...</p>
        </div>
      )}

      {/* Board Content */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        paddingBottom: '20px'
      }}>
        {sortedColumns.length > 0 ? (
          sortedColumns.map((column, index) => {
            const bucketName = columnBucketMap[column.title] || column.title.toLowerCase().replace(/\s+/g, '-');
            const columnTasks = rawTasks.filter((task: Task) => task && task['card-bucket'] === bucketName);

            const colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];
            const bgColor = colors[index % colors.length];

            return (
              <div key={column.id} style={{
                minWidth: '340px',
                maxWidth: '340px',
                background: 'white',
                borderRadius: '12px',
                padding: '16px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
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
                  overflowY: 'auto'
                }}>
                  {columnTasks.map((task: Task) => {
                    if (!task) return null;

                    return (
                      <div key={task['req-id']} style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '16px',
                        transition: 'all 0.2s',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
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

                      </div>
                    );
                  })}

                  {columnTasks.length === 0 && (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#9ca3af',
                      fontSize: '14px'
                    }}>
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          !columnsLoading && !tasksLoading && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              color: 'white',
              fontSize: '18px',
              paddingTop: '40px'
            }}>
              No columns found.
            </div>
          )
        )}
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
