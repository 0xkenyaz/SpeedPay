import { USDC_ADDRESSES, ERC20_ABI, EURC_ADDRESS_ARC } from './constants';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    phantom?: {
      solana?: any;
      ethereum?: any;
    };
  }
}

export type WalletType = 'metamask' | 'phantom-evm' | 'phantom-solana' | null;

export interface WalletState {
  address: string | null;
  walletType: WalletType;
  chainId: number | null;
  nativeBalance: string | null;
  usdcBalance: string | null;
  eurcBalance: string | null;
  isConnected: boolean;
}

export async function connectMetaMask(): Promise<{ address: string; chainId: number }> {
  if (!window.ethereum) throw new Error('MetaMask not installed. Please install MetaMask extension.');
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  const chainId = await window.ethereum.request({ method: 'eth_chainId' });
  return { address: accounts[0], chainId: parseInt(chainId, 16) };
}

export async function connectPhantomSolana(): Promise<{ address: string }> {
  const provider = window.phantom?.solana || window.solana;
  if (!provider) throw new Error('Phantom wallet not installed.');
  const resp = await provider.connect();
  return { address: resp.publicKey.toString() };
}

export async function connectPhantomEVM(): Promise<{ address: string; chainId: number }> {
  const provider = window.phantom?.ethereum || window.ethereum;
  if (!provider) throw new Error('Phantom EVM not available.');
  const accounts = await provider.request({ method: 'eth_requestAccounts' });
  const chainId = await provider.request({ method: 'eth_chainId' });
  return { address: accounts[0], chainId: parseInt(chainId, 16) };
}

export async function getNativeBalance(address: string, provider?: any): Promise<string> {
  try {
    const eth = provider || window.ethereum;
    if (!eth) return '0';
    const balance = await eth.request({
      method: 'eth_getBalance',
      params: [address, 'latest'],
    });
    const wei = BigInt(balance);
    const ether = Number(wei) / 1e18;
    return ether.toFixed(4);
  } catch {
    return '0';
  }
}

export async function getUSDCBalance(address: string, chainId: string = 'arc-testnet', provider?: any): Promise<string> {
  try {
    const eth = provider || window.ethereum;
    if (!eth) return '0';
    const contractAddr = USDC_ADDRESSES[chainId];
    if (!contractAddr) return '0';

    // Encode balanceOf(address)
    const selector = '0x70a08231';
    const paddedAddr = address.slice(2).toLowerCase().padStart(64, '0');
    const data = selector + paddedAddr;

    const result = await eth.request({
      method: 'eth_call',
      params: [{ to: contractAddr, data }, 'latest'],
    });

    const balance = BigInt(result || '0x0');
    return (Number(balance) / 1e6).toFixed(2);
  } catch {
    return '0';
  }
}

export async function getEURCBalance(address: string, provider?: any): Promise<string> {
  try {
    const eth = provider || window.ethereum;
    if (!eth) return '0';

    const selector = '0x70a08231';
    const paddedAddr = address.slice(2).toLowerCase().padStart(64, '0');
    const data = selector + paddedAddr;

    const result = await eth.request({
      method: 'eth_call',
      params: [{ to: EURC_ADDRESS_ARC, data }, 'latest'],
    });

    const balance = BigInt(result || '0x0');
    return (Number(balance) / 1e6).toFixed(2);
  } catch {
    return '0';
  }
}

export async function sendUSDC(
  from: string,
  to: string,
  amount: string,
  chainId: string = 'arc-testnet',
  provider?: any
): Promise<string> {
  const eth = provider || window.ethereum;
  if (!eth) throw new Error('No provider');

  const contractAddr = USDC_ADDRESSES[chainId];
  if (!contractAddr) throw new Error('USDC not supported on this chain');

  const amountWei = BigInt(Math.floor(parseFloat(amount) * 1e6));
  
  // Encode transfer(address,uint256)
  const selector = '0xa9059cbb';
  const paddedTo = to.slice(2).toLowerCase().padStart(64, '0');
  const paddedAmount = amountWei.toString(16).padStart(64, '0');
  const data = selector + paddedTo + paddedAmount;

  const txHash = await eth.request({
    method: 'eth_sendTransaction',
    params: [{
      from,
      to: contractAddr,
      data,
      gas: '0x186A0',
    }],
  });

  return txHash;
}

export function shortenAddress(addr: string): string {
  if (!addr) return '';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function formatNumber(num: string | number, decimals: number = 2): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0.00';
  return n.toFixed(decimals);
}
