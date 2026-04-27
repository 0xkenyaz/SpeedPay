'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import WalletBar from '@/components/WalletBar';
import { useWallet } from '@/components/WalletContext';

const SendPage = dynamic(() => import('./send/page'), { ssr: false });
const SwapPage = dynamic(() => import('./swap/page'), { ssr: false });
const BridgePage = dynamic(() => import('./bridge/page'), { ssr: false });

type Tab = 'send' | 'swap' | 'bridge';

const tabs = [
  {
    id: 'send' as Tab,
    label: 'Send',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
    desc: 'Transfer USDC',
  },
  {
    id: 'swap' as Tab,
    label: 'Swap',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
      </svg>
    ),
    desc: 'USDC ↔ EURC',
  },
  {
    id: 'bridge' as Tab,
    label: 'Bridge',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
    desc: 'Cross-chain',
  },
];

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="spinner !w-8 !h-8"></div>
    </div>
  );
}

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>('send');
  const { usdcBalance, nativeBalance, isConnected } = useWallet();

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Background mesh */}
      <div className="fixed inset-0 bg-mesh-gradient pointer-events-none"></div>
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,229,209,0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      ></div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-arc-accent to-brand-600 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 0 20px rgba(0,229,209,0.3)' }}>
              <svg className="w-6 h-6 text-arc-bg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-space)' }}>
                Pay<span style={{ color: 'var(--accent)' }}>Flow</span>
              </h1>
              <div className="text-xs text-arc-muted font-mono flex items-center gap-1.5">
                <span className="status-dot online"></span>
                Arc Testnet
              </div>
            </div>
          </div>
          <WalletBar />
        </header>

        {/* Quick stats bar (when connected) */}
        {isConnected && (
          <div className="grid grid-cols-2 gap-3 mb-6 animate-slide-up">
            <div className="glass-card rounded-2xl p-3 border border-arc-border">
              <div className="text-xs text-arc-muted mb-0.5">USDC</div>
              <div className="text-base font-bold font-mono text-arc-accent">${usdcBalance || '0.00'}</div>
            </div>
            <div className="glass-card rounded-2xl p-3 border border-arc-border">
              <div className="text-xs text-arc-muted mb-0.5">Native</div>
              <div className="text-base font-bold font-mono text-white">{nativeBalance || '0.0000'} <span className="text-arc-muted text-xs">ARC</span></div>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div className="glass-card rounded-3xl overflow-hidden border border-arc-border shadow-2xl">
          {/* Tab Navigation */}
          <div className="flex border-b border-arc-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 py-4 px-2 flex flex-col items-center gap-1 transition-all relative ${
                  activeTab === tab.id
                    ? 'text-arc-accent bg-arc-accent/5 tab-active'
                    : 'text-arc-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="text-xs font-semibold">{tab.label}</span>
                <span className={`text-[10px] font-mono ${activeTab === tab.id ? 'text-arc-accent/70' : 'text-arc-muted/60'}`}>
                  {tab.desc}
                </span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            <Suspense fallback={<LoadingSpinner />}>
              {activeTab === 'send' && <SendPage />}
              {activeTab === 'swap' && <SwapPage />}
              {activeTab === 'bridge' && <BridgePage />}
            </Suspense>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-4 text-xs text-arc-muted">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Non-custodial
            </span>
            <span className="text-arc-border">•</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Powered by Circle
            </span>
            <span className="text-arc-border">•</span>
            <span>Arc Testnet</span>
          </div>
          <div className="text-[11px] text-arc-muted/50 font-mono">
            PayFlow v0.1.0 — Testnet only. Not for production use.
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
