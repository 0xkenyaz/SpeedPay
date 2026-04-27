'use client';

import { useState } from 'react';
import { useWallet } from '@/components/WalletContext';
import TxResult from '@/components/TxResult';
import { sendUSDC } from '@/lib/wallet';
import { SUPPORTED_CHAINS } from '@/lib/constants';

const arcChain = SUPPORTED_CHAINS[0];

export default function SendPage() {
  const { address, isConnected, usdcBalance, nativeBalance, refreshBalances } = useWallet();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('0.01');
  const [token, setToken] = useState<'USDC' | 'NATIVE'>('USDC');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const handleSend = async () => {
    if (!address) return;
    if (!recipient || !recipient.startsWith('0x') || recipient.length !== 42) {
      setError('Please enter a valid EVM address (0x...)');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (token === 'USDC' && parseFloat(amount) > parseFloat(usdcBalance || '0')) {
      setError('Insufficient USDC balance');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const hash = await sendUSDC(address, recipient, amount);
      setTxHash(hash);
      setTimeout(refreshBalances, 2000);
    } catch (e: any) {
      setError(e.message || 'Transaction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTxHash('');
    setRecipient('');
    setAmount('0.01');
    setError('');
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-arc-accent/5 border border-arc-accent/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-arc-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Send USDC</h3>
        <p className="text-arc-muted text-sm max-w-xs">Connect your wallet to send USDC on Arc Testnet</p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="max-w-md mx-auto">
        <TxResult
          hash={txHash}
          explorer={arcChain.explorer}
          chainName={arcChain.name}
          onReset={handleReset}
          label={`Send ${amount} ${token}`}
        />
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      {/* Balance Display */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-2xl bg-arc-card border border-arc-border">
          <div className="text-xs text-arc-muted mb-1">USDC Balance</div>
          <div className="text-xl font-bold font-mono text-arc-accent">${usdcBalance || '0.00'}</div>
        </div>
        <div className="p-4 rounded-2xl bg-arc-card border border-arc-border">
          <div className="text-xs text-arc-muted mb-1">ARC Balance</div>
          <div className="text-xl font-bold font-mono text-white">{nativeBalance || '0.0000'}</div>
        </div>
      </div>

      {/* Network Badge */}
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-arc-border bg-arc-card/50 w-fit">
        <span className="status-dot online"></span>
        <span className="text-xs text-arc-muted font-mono">{arcChain.name}</span>
      </div>

      {/* Token Selector */}
      <div>
        <label className="block text-sm font-medium text-arc-muted mb-2">Token</label>
        <div className="grid grid-cols-2 gap-2">
          {(['USDC', 'NATIVE'] as const).map(t => (
            <button
              key={t}
              onClick={() => setToken(t)}
              className={`py-3 rounded-xl border text-sm font-semibold transition-all ${
                token === t
                  ? 'border-arc-accent bg-arc-accent/10 text-arc-accent'
                  : 'border-arc-border text-arc-muted hover:border-arc-border/80 hover:text-white'
              }`}
            >
              {t === 'USDC' ? '💵 USDC' : '⬡ ARC (Native)'}
            </button>
          ))}
        </div>
      </div>

      {/* Recipient */}
      <div>
        <label className="block text-sm font-medium text-arc-muted mb-2">Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={e => setRecipient(e.target.value)}
          placeholder="0x..."
          className="glow-input w-full px-4 py-3.5 rounded-xl text-sm font-mono text-white placeholder-arc-muted/50"
        />
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-arc-muted">Amount</label>
          <button
            onClick={() => setAmount(token === 'USDC' ? (usdcBalance || '0') : (nativeBalance || '0'))}
            className="text-xs text-arc-accent hover:text-arc-accent/70 transition-colors font-mono"
          >
            MAX: {token === 'USDC' ? `$${usdcBalance || '0'}` : `${nativeBalance || '0'} ARC`}
          </button>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.01"
            className="glow-input w-full px-4 py-3.5 rounded-xl text-lg font-mono text-white pr-20"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-arc-muted text-sm font-mono font-semibold">
            {token === 'USDC' ? 'USDC' : 'ARC'}
          </span>
        </div>
      </div>

      {/* Quick amounts */}
      <div className="flex gap-2">
        {['0.01', '0.1', '1', '10'].map(v => (
          <button
            key={v}
            onClick={() => setAmount(v)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              amount === v
                ? 'border-arc-accent/50 text-arc-accent bg-arc-accent/10'
                : 'border-arc-border text-arc-muted hover:text-white'
            }`}
          >
            {v}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-arc-danger/10 border border-arc-danger/30 text-arc-danger text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Summary */}
      {recipient && amount && parseFloat(amount) > 0 && (
        <div className="p-4 rounded-xl bg-black/30 border border-arc-border space-y-2 text-sm animate-fade-in">
          <div className="flex justify-between text-arc-muted">
            <span>Sending</span>
            <span className="font-mono text-white">{amount} {token}</span>
          </div>
          <div className="flex justify-between text-arc-muted">
            <span>To</span>
            <span className="font-mono text-white">{recipient.slice(0, 8)}...{recipient.slice(-6)}</span>
          </div>
          <div className="flex justify-between text-arc-muted">
            <span>Network</span>
            <span className="text-arc-accent">Arc Testnet</span>
          </div>
          <div className="border-t border-arc-border pt-2 flex justify-between">
            <span className="text-arc-muted">Est. Fee</span>
            <span className="font-mono text-arc-gold">~0.001 ARC</span>
          </div>
        </div>
      )}

      <button
        onClick={handleSend}
        disabled={loading || !recipient || !amount}
        className="btn-accent w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="spinner !border-arc-bg/30 !border-t-arc-bg"></span>
            Sending...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send {token}
          </>
        )}
      </button>
    </div>
  );
}
