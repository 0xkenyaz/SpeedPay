// Arc Testnet Chain Config
export const ARC_TESTNET = {
  id: 1516,
  name: 'Arc Testnet',
  network: 'arc-testnet',
  nativeCurrency: { name: 'ARC', symbol: 'ARC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.arc.io'] },
    public: { http: ['https://rpc.arc.io'] },
  },
  blockExplorers: {
    default: { name: 'Arc Explorer', url: 'https://explorer.arc.io' },
  },
  testnet: true,
};

// USDC contract addresses
export const USDC_ADDRESSES: Record<string, string> = {
  'arc-testnet': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  'eth-sepolia': '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
  'base-sepolia': '0x036CbD53842c5426634e7929541eC2318f3dCF7e',
  'solana-devnet': 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr',
};

// EURC contract addresses (Arc Testnet)
export const EURC_ADDRESS_ARC = '0x08210F9170F89Ab7658F0B5E3fF39b0E03C2Bfa9';

export const SUPPORTED_CHAINS = [
  {
    id: 'arc-testnet',
    name: 'Arc Testnet',
    chainId: 1516,
    symbol: 'ARC',
    color: '#00e5d1',
    explorer: 'https://explorer.arc.io',
    icon: '⬡',
  },
  {
    id: 'eth-sepolia',
    name: 'Ethereum Sepolia',
    chainId: 11155111,
    symbol: 'ETH',
    color: '#627EEA',
    explorer: 'https://sepolia.etherscan.io',
    icon: '⟠',
  },
  {
    id: 'base-sepolia',
    name: 'Base Sepolia',
    chainId: 84532,
    symbol: 'ETH',
    color: '#0052FF',
    explorer: 'https://sepolia.basescan.org',
    icon: '⬜',
  },
  {
    id: 'solana-devnet',
    name: 'Solana Devnet',
    chainId: 0,
    symbol: 'SOL',
    color: '#9945FF',
    explorer: 'https://explorer.solana.com/?cluster=devnet',
    icon: '◎',
  },
];

export const BRIDGE_ROUTES = [
  {
    from: 'arc-testnet',
    to: 'eth-sepolia',
    label: 'Arc Testnet → Ethereum Sepolia',
  },
  {
    from: 'eth-sepolia',
    to: 'arc-testnet',
    label: 'Ethereum Sepolia → Arc Testnet',
  },
  {
    from: 'arc-testnet',
    to: 'base-sepolia',
    label: 'Arc Testnet → Base Sepolia',
  },
  {
    from: 'base-sepolia',
    to: 'arc-testnet',
    label: 'Base Sepolia → Arc Testnet',
  },
  {
    from: 'arc-testnet',
    to: 'solana-devnet',
    label: 'Arc Testnet → Solana Devnet',
  },
  {
    from: 'solana-devnet',
    to: 'arc-testnet',
    label: 'Solana Devnet → Arc Testnet',
  },
];

export const KIT_KEY = process.env.NEXT_PUBLIC_KIT_KEY || '';

// ERC20 minimal ABI for balance checks
export const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    type: 'function',
    stateMutability: 'nonpayable',
  },
];
