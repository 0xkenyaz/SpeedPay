'use client';

import { useState } from 'react';
import { useWallet } from './WalletContext';
import { shortenAddress } from '@/lib/wallet';

export default function WalletBar() {
  const { address, isConnected, walletType, nativeBalance, usdcBalance, eurcBalance, connect, disconnect, isLoading, error, refreshBalances } = useWallet();
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl border border-arc-border bg-arc-card hover:border-arc-accent/50 transition-all duration-200 group"
        >
          <div className="relative">
            <span className="status-dot online"></span>
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs text-arc-muted font-mono">
              {walletType === 'metamask' ? '🦊' : '👻'} {walletType?.replace('-', ' ')}
            </div>
            <div className="text-sm font-mono font-medium text-arc-accent">
              {shortenAddress(address)}
            </div>
          </div>
          <div className="sm:hidden text-sm font-mono text-arc-accent">
            {shortenAddress(address)}
          </div>
          <svg className={`w-4 h-4 text-arc-muted transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDetails && (
          <div className="absolute right-0 top-full mt-2 w-72 glass-card rounded-2xl p-4 z-50 shadow-2xl border border-arc-border animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-xs text-arc-muted mb-1">Connected Wallet</div>
                <div className="text-sm font-mono text-arc-accent break-all">{address}</div>
              </div>
              <button
                onClick={refreshBalances}
                className="p-2 rounded-lg hover:bg-white/5 text-arc-muted hover:text-arc-accent transition-colors"
                title="Refresh balances"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-xs text-arc-muted">USDC Balance</span>
                <span className="text-sm font-mono font-semibold text-white">${usdcBalance || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-xs text-arc-muted">EURC Balance</span>
                <span className="text-sm font-mono font-semibold text-white">€{eurcBalance || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center p-2 rounded-lg bg-white/5">
                <span className="text-xs text-arc-muted">Native Balance</span>
                <span className="text-sm font-mono font-semibold text-white">{nativeBalance || '0.0000'}</span>
              </div>
            </div>

            <button
              onClick={() => { disconnect(); setShowDetails(false); }}
              className="w-full py-2 rounded-xl border border-arc-danger/40 text-arc-danger text-sm hover:bg-arc-danger/10 transition-all"
            >
              Disconnect Wallet
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        disabled={isLoading}
        className="btn-accent px-4 py-2 rounded-xl text-sm flex items-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="spinner !w-4 !h-4"></span>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
          <div
            className="relative glass-card rounded-3xl p-8 w-full max-w-sm z-10 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-arc-muted hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-arc-accent/10 flex items-center justify-center mx-auto mb-4 border border-arc-accent/20">
                <svg className="w-8 h-8 text-arc-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-1">Connect Wallet</h2>
              <p className="text-arc-muted text-sm">Choose your wallet to get started</p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-arc-danger/10 border border-arc-danger/30 text-arc-danger text-sm text-center">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={async () => { await connect('metamask'); setShowModal(false); }}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-arc-border hover:border-orange-500/50 hover:bg-orange-500/5 transition-all group"
              >
                <div className="text-3xl">🦊</div>
                <div className="text-left">
                  <div className="font-semibold">MetaMask</div>
                  <div className="text-xs text-arc-muted">EVM compatible wallets</div>
                </div>
                <svg className="w-4 h-4 text-arc-muted ml-auto group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={async () => { await connect('phantom'); setShowModal(false); }}
                disabled={isLoading}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-arc-border hover:border-purple-500/50 hover:bg-purple-500/5 transition-all group"
              >
                <div className="text-3xl">👻</div>
                <div className="text-left">
                  <div className="font-semibold">Phantom</div>
                  <div className="text-xs text-arc-muted">Solana & EVM support</div>
                </div>
                <svg className="w-4 h-4 text-arc-muted ml-auto group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <p className="text-center text-xs text-arc-muted mt-6">
              By connecting, you agree to our{' '}
              <span className="text-arc-accent cursor-pointer">Terms of Service</span>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
