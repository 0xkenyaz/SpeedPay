# PayFlow 💳⚡

**Cross-chain payments app** built on Arc Testnet. Send, Swap, and Bridge USDC using Circle App Kit.

## Features

- 🚀 **Send** — Transfer USDC (or native ARC token) on Arc Testnet
- 🔄 **Swap** — Swap USDC ↔ EURC on Arc Testnet via Circle App Kit
- 🌉 **Bridge** — Bridge USDC bidirectionally across Arc Testnet ↔ Ethereum Sepolia, Base Sepolia, Solana Devnet
- 👛 **Wallet Support** — MetaMask + Phantom (EVM & Solana)
- 📊 **Live Balances** — Real-time USDC, EURC, and native token balances
- ✅ **Tx Explorer** — Success state with direct block explorer links

## Environment Variables

```bash
NEXT_PUBLIC_KIT_KEY=0dc825cd8759085d6508a455b760f72a:39fc2ce3c846009fbcd76d0da53eb339
```

## Local Development

```bash
npm install
cp .env.example .env.local
# Edit .env.local and add your KIT_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then add env var:
vercel env add NEXT_PUBLIC_KIT_KEY
```

### Option 2: Vercel Dashboard (GitHub)

1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add Environment Variable: `NEXT_PUBLIC_KIT_KEY` = your key
5. Click Deploy

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Circle App Kit** (`@circle-fin/app-kit`)
- **Circle CCTP** for cross-chain bridging
- **ethers.js** / raw JSON-RPC for wallet interaction

## Network Info

| Network | Chain ID | Explorer |
|---------|----------|---------|
| Arc Testnet | 1516 | https://explorer.arc.io |
| Ethereum Sepolia | 11155111 | https://sepolia.etherscan.io |
| Base Sepolia | 84532 | https://sepolia.basescan.org |
| Solana Devnet | — | https://explorer.solana.com/?cluster=devnet |

## License

MIT
