# NFT Minting dApp

A full-stack NFT minting application built with **Solidity**, **Hardhat**, **Ethers.js**, and **React/Next.js**.

## Features

✨ **ERC-721 Smart Contract** - OpenZeppelin standard implementation  
🔗 **Web3 Wallet Integration** - MetaMask connection  
🎨 **NFT Minting Interface** - Simple and intuitive UI  
🖼️ **NFT Gallery** - View your minted NFTs  
🧪 **Ethereum Testnet** - Deploy and test on Sepolia  

## Prerequisites

- Node.js 18+
- MetaMask wallet extension
- Testnet ETH (get from [Sepolia Faucet](https://sepoliafaucet.com/))

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and add your configuration:

```bash
cp .env.example .env
```

Add your wallet private key and RPC URL to `.env`.

### 3. Compile Smart Contracts

```bash
npm run compile
```

### 4. Deploy to Testnet

Deploy to Sepolia testnet:

```bash
npm run deploy:sepolia
```

Copy the deployed contract address and update `lib/contract-config.ts`:

```ts
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS'
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js app directory
├── components/             # React components
├── contracts/              # Solidity smart contracts
├── scripts/                # Deployment scripts
├── lib/                    # Utilities and config
└── hardhat.config.js       # Hardhat configuration
```

## Smart Contract

The `NFTCollection` contract implements:
- ERC-721 standard with enumerable extension
- Token URI storage for metadata
- Minting with payment requirement
- Owner-only functions for configuration

## Technologies

- **Frontend**: Next.js 15, React 19, TailwindCSS, shadcn/ui
- **Smart Contracts**: Solidity 0.8.20, OpenZeppelin
- **Development**: Hardhat, Ethers.js v6
- **Network**: Ethereum Sepolia Testnet

## Commands

- `npm run dev` - Start development server
- `npm run compile` - Compile smart contracts
- `npm run test` - Run contract tests
- `npm run deploy:sepolia` - Deploy to Sepolia testnet
- `npm run node` - Start local Hardhat node

## License

MIT
