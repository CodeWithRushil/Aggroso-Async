import React from 'react';

interface DiffViewerProps {
  original: any;
  revised: any;
  fieldName: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ original, revised, fieldName }) => {
  // If comparing objects (like attributes)
  if (typeof original === 'object' && original !== null && typeof revised === 'object' && revised !== null) {
    const origStr = JSON.stringify(original, null, 2);
    const revStr = JSON.stringify(revised, null, 2);

    return (
      <div className="diff-container">
        <div className="diff-col">
          <div className="diff-col-header">Original {fieldName}</div>
          <pre className="val-content" style={{ fontSize: '0.82rem' }}>{origStr}</pre>
        </div>
        <div className="diff-col">
          <div className="diff-col-header">Revised {fieldName}</div>
          <pre className="val-content" style={{ fontSize: '0.82rem', color: '#6ee7b7' }}>{revStr}</pre>
        </div>
      </div>
    );
  }

  const origText = String(original || '');
  const revText = String(revised || '');

  // Word-level token diff
  const origWords = origText.split(/(\s+)/);
  const revWords = revText.split(/(\s+)/);

  // Compute set of words in each
  const revWordSet = new Set(revWords.map(w => w.trim().toLowerCase()).filter(Boolean));
  const origWordSet = new Set(origWords.map(w => w.trim().toLowerCase()).filter(Boolean));

  return (
    <div className="diff-container" id={`diff-${fieldName}`}>
      <div className="diff-col">
        <div className="diff-col-header">
          <span>Original {fieldName}</span>
          <span style={{ float: 'right', color: 'var(--rose)', fontSize: '0.75rem' }}>Original text</span>
        </div>
        <div className="val-content">
          {origWords.map((word, idx) => {
            const trimmed = word.trim().toLowerCase();
            const isRemoved = trimmed && !revWordSet.has(trimmed);
            return (
              <span key={idx} className={isRemoved ? 'diff-deleted' : ''}>
                {word}
              </span>
            );
          })}
        </div>
      </div>

      <div className="diff-col">
        <div className="diff-col-header">
          <span>Revised & Approved {fieldName}</span>
          <span style={{ float: 'right', color: 'var(--emerald)', fontSize: '0.75rem' }}>Improved wording</span>
        </div>
        <div className="val-content">
          {revWords.map((word, idx) => {
            const trimmed = word.trim().toLowerCase();
            const isAdded = trimmed && !origWordSet.has(trimmed);
            return (
              <span key={idx} className={isAdded ? 'diff-added' : ''}>
                {word}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
};
