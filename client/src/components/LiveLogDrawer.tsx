import React, { useState, useEffect } from 'react';
import { AppLogEntry } from '../types/index.js';
import { fetchLogs, clearLogs } from '../services/api.js';
import { X, Trash2, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

interface LiveLogDrawerProps {
  onClose: () => void;
}

export const LiveLogDrawer: React.FC<LiveLogDrawerProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<AppLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filterLevel, setFilterLevel] = useState<'ALL' | 'info' | 'warn' | 'error' | 'debug'>('ALL');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchLogs(150);
      setLogs(data);
    } catch (err) {
      console.error('Failed fetching logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    if (!autoRefresh) return;
    const interval = setInterval(loadLogs, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleClear = async () => {
    await clearLogs();
    setLogs([]);
  };

  const filtered = logs.filter(l => filterLevel === 'ALL' || l.level === filterLevel);

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} id="live-log-drawer">
      <div className="modal-content modal-content-large" style={{ maxHeight: '85vh' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={20} color="var(--cyan)" />
            <div>
              <h2 style={{ fontSize: '1.2rem' }}>AI Workflow & Application Event Stream</h2>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                Structured logs of policy retrieval, validation rules, LLM prompts, and review decisions
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              className={`btn btn-sm ${autoRefresh ? 'btn-emerald' : 'btn-secondary'}`}
              onClick={() => setAutoRefresh(!autoRefresh)}
              id="btn-toggle-auto-refresh"
            >
              <CheckCircle size={13} /> {autoRefresh ? 'Live Auto-Polling (3s)' : 'Paused'}
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={loadLogs}
              disabled={isLoading}
              id="btn-refresh-logs"
            >
              <RefreshCw size={13} className={isLoading ? 'loading-spinner' : ''} />
            </button>

            <button
              className="btn btn-rose btn-sm"
              onClick={handleClear}
              id="btn-clear-logs"
            >
              <Trash2 size={13} /> Clear
            </button>

            <button className="btn btn-secondary btn-sm" onClick={onClose} id="btn-close-log-modal">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body" style={{ background: '#050811', padding: '16px' }}>
          {/* Level Filter */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
            {(['ALL', 'info', 'warn', 'error', 'debug'] as const).map(lvl => (
              <button
                key={lvl}
                className={`filter-pill ${filterLevel === lvl ? 'active' : ''}`}
                style={{ textTransform: 'uppercase', fontSize: '0.75rem' }}
                onClick={() => setFilterLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Terminal Log Console */}
          <div style={{ 
            fontFamily: 'var(--font-mono)', 
            fontSize: '0.8rem', 
            maxHeight: '520px', 
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            {filtered.length === 0 ? (
              <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px' }}>
                No events recorded.
              </div>
            ) : (
              filtered.map(entry => {
                const color = entry.level === 'error' ? 'var(--rose)' : entry.level === 'warn' ? 'var(--amber)' : entry.level === 'debug' ? 'var(--secondary)' : 'var(--cyan)';
                return (
                  <div key={entry.id} style={{ 
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
                    padding: '6px 0',
                    lineHeight: '1.4'
                  }}>
                    <span style={{ color: 'var(--text-dim)', marginRight: '8px' }}>
                      [{new Date(entry.timestamp).toLocaleTimeString()}]
                    </span>
                    <span style={{ color, fontWeight: 700, marginRight: '8px' }}>
                      [{entry.level.toUpperCase()}]
                    </span>
                    <span style={{ 
                      background: 'rgba(255, 255, 255, 0.06)', 
                      padding: '1px 6px', 
                      borderRadius: '4px', 
                      color: 'var(--text-main)', 
                      marginRight: '8px' 
                    }}>
                      {entry.context}
                    </span>
                    <span style={{ color: '#e2e8f0' }}>{entry.message}</span>

                    {entry.metadata && Object.keys(entry.metadata).length > 0 && (
                      <div style={{ 
                        color: 'var(--text-dim)', 
                        fontSize: '0.75rem', 
                        paddingLeft: '20px',
                        marginTop: '2px'
                      }}>
                        {JSON.stringify(entry.metadata)}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
