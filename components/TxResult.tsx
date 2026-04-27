'use client';

interface TxResultProps {
  hash: string;
  explorer: string;
  chainName?: string;
  onReset: () => void;
  label?: string;
}

export default function TxResult({ hash, explorer, chainName, onReset, label = 'Transaction' }: TxResultProps) {
  const explorerUrl = `${explorer}/tx/${hash}`;
  
  return (
    <div className="success-pop p-6 rounded-2xl border border-arc-success/30 bg-arc-success/5 text-center">
      <div className="w-16 h-16 rounded-full bg-arc-success/10 flex items-center justify-center mx-auto mb-4 border border-arc-success/30">
        <svg className="w-8 h-8 text-arc-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      
      <div className="text-arc-success font-bold text-lg mb-1">Success!</div>
      {chainName && (
        <div className="text-arc-muted text-sm mb-4">{label} confirmed on {chainName}</div>
      )}

      <div className="mb-4 p-3 rounded-xl bg-black/30 border border-arc-border">
        <div className="text-xs text-arc-muted mb-1 font-mono">Transaction Hash</div>
        <div className="text-xs font-mono text-arc-accent break-all">{hash}</div>
      </div>

      <div className="flex gap-3">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-arc-accent/40 text-arc-accent text-sm hover:bg-arc-accent/10 transition-all font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          View on Explorer
        </a>
        <button
          onClick={onReset}
          className="flex-1 py-2.5 px-4 rounded-xl border border-arc-border text-sm hover:bg-white/5 transition-all text-arc-muted hover:text-white font-medium"
        >
          New Transaction
        </button>
      </div>
    </div>
  );
}
