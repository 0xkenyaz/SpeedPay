'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletContext';
import TxResult from '@/components/TxResult';
import { KIT_KEY, SUPPORTED_CHAINS, BRIDGE_ROUTES } from '@/lib/constants';

const chainMap = Object.fromEntries(SUPPORTED_CHAINS.map(c => [c.id, c]));

declare global {
  interface Window {
    CircleAppKit?: any;
  }
}

export default function BridgePage() {
  const { address, isConnected, usdcBalance, refreshBalances } = useWallet();
  const [fromChain, setFromChain] = useState('arc-testnet');
  const [toChain, setToChain] = useState('eth-sepolia');
  const [amount, setAmount] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [kitLoaded, setKitLoaded] = useState(false);
  const [estimatedTime, setEstimatedTime] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.CircleAppKit) { setKitLoaded(true); return; }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@circle-fin/app-kit@latest/dist/index.js';
    script.onload = () => setKitLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Estimate bridge time based on destination
  useEffect(() => {
    const times: Record<string, string> = {
      'eth-sepolia': '~5 min',
      'base-sepolia': '~2 min',
      'solana-devnet': '~10 min',
      'arc-testnet': '~3 min',
    };
    setEstimatedTime(times[toChain] || '~5 min');
  }, [toChain]);

  // Get valid routes from selected fromChain
  const validToChains = BRIDGE_ROUTES
    .filter(r => r.from === fromChain)
    .map(r => r.to);

  const handleFromChainChange = (chainId: string) => {
    setFromChain(chainId);
    const firstValid = BRIDGE_ROUTES.find(r => r.from === chainId);
    if (firstValid) setToChain(firstValid.to);
  };

  const flipChains = () => {
    if (validToChains.includes(toChain)) {
      const oldFrom = fromChain;
      setFromChain(toChain);
      setToChain(oldFrom);
    }
  };

  const handleBridge = async () => {
    if (!address) return;
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (fromChain === 'arc-testnet' && parseFloat(amount) > parseFloat(usdcBalance || '0')) {
      setError('Insufficient USDC balance');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (kitLoaded && window.CircleAppKit && KIT_KEY) {
        const kit = new window.CircleAppKit({
          kitKey: KIT_KEY,
          network: fromChain,
        });
        const result = await kit.bridge({
          fromChain,
          toChain,
          token: 'USDC',
          amount,
          userAddress: address,
        });
        setTxHash(result.txHash || result.transactionHash);
      } else {
        // Fallback: Circle CCTP bridge
        const provider = window.ethereum;
        if (!provider) throw new Error('No wallet provider');

        // Circle CCTP TokenMessenger on Arc Testnet
        const TOKEN_MESSENGER = '0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5';
        
        // destinationDomain mapping (Circle CCTP)
        const domainMap: Record<string, number> = {
          'eth-sepolia': 0,
          'arc-testnet': 7,
          'base-sepolia': 6,
          'solana-devnet': 5,
        };
        
        const destDomain = domainMap[toChain] ?? 0;
        const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));
        
        // depositForBurn(amount, destinationDomain, mintRecipient, burnToken)
        const selector = '0x6fd3504e';
        const paddedAmount = amountWei.toString(16).padStart(64, '0');
        const paddedDomain = destDomain.toString(16).padStart(64, '0');
        const paddedRecipient = address.slice(2).toLowerCase().padStart(64, '0');
        const USDC_ARC = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
        const paddedToken = USDC_ARC.slice(2).toLowerCase().padStart(64, '0');

        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: TOKEN_MESSENGER,
            data: '0x' + selector.slice(2) + paddedAmount + paddedDomain + paddedRecipient + paddedToken,
            gas: '0x7A120',
          }],
        });
        setTxHash(txHash);
      }

      setTimeout(refreshBalances, 2000);
    } catch (e: any) {
      if (e.code === 4001) {
        setError('Transaction rejected by user.');
      } else if (e.message?.includes('execution reverted')) {
        setError('Bridge contract reverted. Ensure USDC is approved and you have enough balance.');
      } else {
        setError(e.message || 'Bridge failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTxHash('');
    setAmount('0.01');
    setError('');
  };

  const fromChainData = chainMap[fromChain];
  const toChainData = chainMap[toChain];

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-arc-accent/5 border border-arc-accent/20 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-arc-accent/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
          </svg>
        </div>
        <h3 className="text-xl font-bold mb-2">Bridge USDC</h3>
        <p className="text-arc-muted text-sm max-w-xs">Connect your wallet to bridge USDC across chains</p>
      </div>
    );
  }

  if (txHash) {
    return (
      <div className="max-w-md mx-auto">
        <TxResult
          hash={txHash}
          explorer={fromChainData?.explorer || 'https://explorer.arc.io'}
          chainName={`${fromChainData?.name} → ${toChainData?.name}`}
          onReset={handleReset}
          label={`Bridge ${amount} USDC`}
        />
        <div className="mt-4 p-4 rounded-xl bg-arc-gold/5 border border-arc-gold/20 text-center">
          <div className="text-arc-gold text-sm font-semibold mb-1">⏳ Cross-chain in progress</div>
          <div className="text-arc-muted text-xs">
            Estimated arrival: {estimatedTime} on {toChainData?.name}
          </div>
          {toChainData && (
            <a
              href={toChainData.explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-arc-accent hover:underline mt-2"
            >
              Check destination explorer →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5 animate-fade-in">
      {/* USDC Balance */}
      <div className="p-4 rounded-2xl bg-arc-card border border-arc-border">
        <div className="text-xs text-arc-muted mb-1">USDC Available to Bridge</div>
        <div className="text-2xl font-bold font-mono text-arc-accent">${usdcBalance || '0.00'}</div>
        <div className="text-xs text-arc-muted mt-1">on {fromChainData?.name}</div>
      </div>

      {/* Kit status */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-arc-border bg-arc-card/50 text-xs w-fit">
        <span className={`status-dot ${KIT_KEY ? 'online' : ''}`} style={!KIT_KEY ? { background: '#f0a500', boxShadow: '0 0 6px rgba(240,165,0,0.6)' } : {}}></span>
        <span className="font-mono text-arc-muted">
          Powered by Circle CCTP {KIT_KEY ? '+ App Kit' : ''}
        </span>
      </div>

      {/* Chain Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-arc-muted">From Chain</label>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_CHAINS.filter(c => BRIDGE_ROUTES.some(r => r.from === c.id)).map(chain => (
            <button
              key={chain.id}
              onClick={() => handleFromChainChange(chain.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                fromChain === chain.id
                  ? 'border-arc-accent bg-arc-accent/10 text-arc-accent'
                  : 'border-arc-border text-arc-muted hover:border-arc-border/80 hover:text-white'
              }`}
            >
              <span className="text-lg">{chain.icon}</span>
              <span className="font-medium text-xs">{chain.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Arrow + flip */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-dashed border-arc-border"></div>
        <button
          onClick={flipChains}
          className="w-9 h-9 rounded-full border border-arc-border bg-arc-card hover:border-arc-accent/50 hover:bg-arc-accent/10 transition-all flex items-center justify-center group"
        >
          <svg className="w-4 h-4 text-arc-muted group-hover:text-arc-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        </button>
        <div className="flex-1 border-t border-dashed border-arc-border"></div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-arc-muted">To Chain</label>
        <div className="grid grid-cols-2 gap-2">
          {SUPPORTED_CHAINS.filter(c => validToChains.includes(c.id)).map(chain => (
            <button
              key={chain.id}
              onClick={() => setToChain(chain.id)}
              className={`flex items-center gap-2 p-3 rounded-xl border text-sm transition-all ${
                toChain === chain.id
                  ? 'border-arc-accent bg-arc-accent/10 text-arc-accent'
                  : 'border-arc-border text-arc-muted hover:border-arc-border/80 hover:text-white'
              }`}
            >
              <span className="text-lg">{chain.icon}</span>
              <span className="font-medium text-xs">{chain.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Route summary */}
      <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-arc-border text-xs">
        <div className="flex items-center gap-2">
          <span style={{ color: fromChainData?.color }}>{fromChainData?.icon}</span>
          <span className="text-arc-muted">{fromChainData?.name}</span>
        </div>
        <div className="flex items-center gap-1 text-arc-accent">
          <span>USDC</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-arc-muted">{toChainData?.name}</span>
          <span style={{ color: toChainData?.color }}>{toChainData?.icon}</span>
        </div>
      </div>

      {/* Amount */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-arc-muted">Amount (USDC)</label>
          <button
            onClick={() => setAmount(usdcBalance || '0')}
            className="text-xs text-arc-accent hover:opacity-70 font-mono"
          >
            MAX: ${usdcBalance || '0'}
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
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-arc-muted text-sm font-mono font-semibold">USDC</span>
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

      {/* Bridge details */}
      <div className="p-4 rounded-xl bg-black/20 border border-arc-border space-y-2 text-sm">
        <div className="flex justify-between text-arc-muted">
          <span>You send</span>
          <span className="font-mono text-white">{amount} USDC</span>
        </div>
        <div className="flex justify-between text-arc-muted">
          <span>You receive</span>
          <span className="font-mono text-white">~{amount} USDC</span>
        </div>
        <div className="flex justify-between text-arc-muted">
          <span>Est. time</span>
          <span className="text-arc-gold">{estimatedTime}</span>
        </div>
        <div className="flex justify-between text-arc-muted">
          <span>Protocol</span>
          <span className="text-arc-accent">Circle CCTP</span>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-arc-danger/10 border border-arc-danger/30 text-arc-danger text-sm flex items-start gap-2">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      <button
        onClick={handleBridge}
        disabled={loading || !amount || parseFloat(amount) <= 0}
        className="btn-accent w-full py-4 rounded-2xl text-base font-bold flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="spinner !border-arc-bg/30 !border-t-arc-bg"></span>
            Bridging...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
            </svg>
            Bridge USDC
          </>
        )}
      </button>
    </div>
  );
}
