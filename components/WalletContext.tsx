'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  connectMetaMask,
  connectPhantomSolana,
  connectPhantomEVM,
  getNativeBalance,
  getUSDCBalance,
  getEURCBalance,
  WalletState,
  WalletType,
} from '@/lib/wallet';

interface WalletContextType extends WalletState {
  connect: (type: 'metamask' | 'phantom') => Promise<void>;
  disconnect: () => void;
  refreshBalances: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<WalletState>({
    address: null,
    walletType: null,
    chainId: null,
    nativeBalance: null,
    usdcBalance: null,
    eurcBalance: null,
    isConnected: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshBalances = useCallback(async () => {
    if (!state.address || !state.isConnected) return;
    try {
      const provider = typeof window !== 'undefined' ? 
        (state.walletType === 'phantom-solana' ? window?.phantom?.solana : window.ethereum) 
        : null;
      
      if (state.walletType === 'phantom-solana') {
        // Solana balance via RPC
        setState(s => ({ ...s, nativeBalance: '~', usdcBalance: '0', eurcBalance: '0' }));
        return;
      }

      const [native, usdc, eurc] = await Promise.all([
        getNativeBalance(state.address),
        getUSDCBalance(state.address),
        getEURCBalance(state.address),
      ]);

      setState(s => ({
        ...s,
        nativeBalance: native,
        usdcBalance: usdc,
        eurcBalance: eurc,
      }));
    } catch (e) {
      console.error('Balance refresh failed:', e);
    }
  }, [state.address, state.isConnected, state.walletType]);

  const connect = useCallback(async (type: 'metamask' | 'phantom') => {
    setIsLoading(true);
    setError(null);
    try {
      if (type === 'metamask') {
        const { address, chainId } = await connectMetaMask();
        const [native, usdc, eurc] = await Promise.all([
          getNativeBalance(address),
          getUSDCBalance(address),
          getEURCBalance(address),
        ]);
        setState({
          address,
          walletType: 'metamask',
          chainId,
          nativeBalance: native,
          usdcBalance: usdc,
          eurcBalance: eurc,
          isConnected: true,
        });
      } else {
        // Try Phantom EVM first, fallback to Solana
        try {
          const { address, chainId } = await connectPhantomEVM();
          const [native, usdc, eurc] = await Promise.all([
            getNativeBalance(address),
            getUSDCBalance(address),
            getEURCBalance(address),
          ]);
          setState({
            address,
            walletType: 'phantom-evm',
            chainId,
            nativeBalance: native,
            usdcBalance: usdc,
            eurcBalance: eurc,
            isConnected: true,
          });
        } catch {
          const { address } = await connectPhantomSolana();
          setState({
            address,
            walletType: 'phantom-solana',
            chainId: 0,
            nativeBalance: '~',
            usdcBalance: '0',
            eurcBalance: '0',
            isConnected: true,
          });
        }
      }
    } catch (e: any) {
      setError(e.message || 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      address: null,
      walletType: null,
      chainId: null,
      nativeBalance: null,
      usdcBalance: null,
      eurcBalance: null,
      isConnected: false,
    });
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const eth = window.ethereum;
    if (!eth) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnect();
      } else if (state.address && accounts[0] !== state.address) {
        setState(s => ({ ...s, address: accounts[0] }));
        setTimeout(refreshBalances, 500);
      }
    };

    const handleChainChanged = (chainId: string) => {
      setState(s => ({ ...s, chainId: parseInt(chainId, 16) }));
      setTimeout(refreshBalances, 500);
    };

    eth.on('accountsChanged', handleAccountsChanged);
    eth.on('chainChanged', handleChainChanged);

    return () => {
      eth.removeListener('accountsChanged', handleAccountsChanged);
      eth.removeListener('chainChanged', handleChainChanged);
    };
  }, [state.address, disconnect, refreshBalances]);

  // Auto-refresh balances every 30s
  useEffect(() => {
    if (!state.isConnected) return;
    const interval = setInterval(refreshBalances, 30000);
    return () => clearInterval(interval);
  }, [state.isConnected, refreshBalances]);

  return (
    <WalletContext.Provider value={{ ...state, connect, disconnect, refreshBalances, isLoading, error }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
