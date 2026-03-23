import { useState } from 'react';

const REPO_OWNER = 'samoletovs';
const REPO_NAME = 'amberRepublic';

export default function FeedbackButton() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [type, setType] = useState<'bug' | 'idea' | 'balance'>('idea');
  const [sent, setSent] = useState(false);

  const typeLabels = {
    bug: { emoji: '🐛', label: 'Bug Report' },
    idea: { emoji: '💡', label: 'Feature Idea' },
    balance: { emoji: '⚖️', label: 'Balance Issue' },
  };

  const handleSubmit = () => {
    if (!text.trim()) return;

    const title = `[${typeLabels[type].emoji} ${typeLabels[type].label}] ${text.slice(0, 80)}`;
    const body = `## ${typeLabels[type].label}\n\n${text}\n\n---\n*Submitted via Amber Republic in-game feedback*`;
    const labels = type === 'bug' ? 'bug' : type === 'balance' ? 'game-balance' : 'enhancement';

    // Open GitHub issue creation URL — works without auth
    const url = `https://github.com/${REPO_OWNER}/${REPO_NAME}/issues/new?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}&labels=${encodeURIComponent(labels)}`;
    window.open(url, '_blank');

    setSent(true);
    setTimeout(() => {
      setOpen(false);
      setSent(false);
      setText('');
    }, 2000);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="shrink-0 w-10 h-10 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5"
        style={{
          background: 'rgba(28, 25, 23, 0.05)',
          color: '#78716C',
          border: '1px solid rgba(28, 25, 23, 0.1)',
        }}
      >
        <span>💬</span>
        <span className="hidden sm:inline">Feedback</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ background: 'rgba(28,25,23,0.3)' }} onClick={() => setOpen(false)}>
      <div 
        className="glass-card w-full sm:max-w-md p-5 sm:p-6 fade-in rounded-t-2xl sm:rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        {sent ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-2">✅</div>
            <p className="text-slate-300">Opening GitHub issue...</p>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold mb-1" style={{ color: '#1C1917' }}>💬 Send Feedback</h3>
            <p className="text-xs mb-4" style={{ color: '#78716C' }}>Creates a GitHub issue for the dev team.</p>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              {(Object.keys(typeLabels) as Array<keyof typeof typeLabels>).map(k => (
                <button
                  key={k}
                  onClick={() => setType(k)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                    type === k 
                      ? 'text-white' 
                      : 'text-stone-500 border border-transparent'
                  }`}
                  style={type === k ? { background: '#9E3039' } : { background: 'rgba(28,25,23,0.04)' }}
                >
                  {typeLabels[k].emoji} {typeLabels[k].label}
                </button>
              ))}
            </div>

            {/* Text input */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Describe what you found, what you'd like, or what feels unbalanced..."
              className="w-full h-28 border rounded-xl p-3 text-sm placeholder-stone-400 resize-none focus:outline-none focus:border-amber/40 transition-colors"
              style={{ background: 'rgba(28,25,23,0.03)', borderColor: 'rgba(28,25,23,0.1)', color: '#1C1917' }}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium" style={{ color: '#78716C', background: 'rgba(28,25,23,0.04)', border: '1px solid rgba(28,25,23,0.08)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!text.trim()}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  text.trim()
                    ? 'text-white cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{
                  background: text.trim() ? '#9E3039' : 'rgba(28,25,23,0.06)',
                  color: text.trim() ? '#FFFFFF' : '#78716C',
                }}
              >
                Open Issue on GitHub
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
