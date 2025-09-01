# 🥬 KALE Links - Stellar Testnet Token Sharing

A production-ready Vite application that enables users to share short HTTPS links on X (Twitter) to send KALE tokens on Stellar Testnet with wallet integration.

## 🚀 Features

- **Link Generator**: Create shareable payment links with recipient, amount, and memo
- **Wallet Integration**: Support for Freighter (primary) and other wallets via Stellar Wallets Kit
- **Transaction Building**: Automated Soroban contract interaction for KALE token transfers
- **SEP-7 Support**: Deep links for compatible wallets
- **Modern UI**: Built with Stellar Design System components

## 🛠 Environment Variables

Add these to your `.env.local` file:

```bash
# Stellar Network Configuration (Testnet)
PUBLIC_STELLAR_NETWORK="TESTNET"
PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"

# KALE Token Configuration
PUBLIC_KALE_CONTRACT_ID="CDSWUUXGPWDZG76ISK6SUCVPZJMD5YUV66J2FXFXFGDX25XKZJIEITAO"
PUBLIC_ORIGIN_DOMAIN="localhost:5173"

# Additional RPC and Explorer Configuration
NEXT_PUBLIC_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_EXPLORER_BASE="https://stellar.expert/explorer/testnet"

# For server-side deploy/maintenance scripts only (DO NOT EXPOSE TO CLIENT)
MNEMONIC="math breeze mixture satoshi motion paddle cradle love smooth collect voice unfair"
DEPLOYER_ACCOUNT_INDEX=0
```

## 📱 How It Works

### 1. Link Generation (`/`)
- Enter recipient Stellar address (G...)
- Specify KALE amount to send
- Add optional memo (max 28 characters)
- Generate shareable link: `https://YOUR_DOMAIN/send?to=G...&amount=42.5&memo=gm`

### 2. Payment Flow (`/send`)
- Parse and validate URL parameters
- Display transaction preview
- Connect wallet (Freighter or others)
- Build Soroban transfer transaction
- Sign in-wallet and submit
- Show transaction result with Stellar Expert link

## 🔧 Technical Implementation

### Core Libraries
- `@stellar/stellar-sdk` - Soroban RPC and contract interactions
- `@stellar/freighter-api` - Freighter wallet integration
- `@stellar-wallets/kit` - Multi-wallet support
- `zod` - Parameter validation
- `zustand` - State management

### Key Components
- `ParamPreview.tsx` - Transaction details display
- `WalletChooser.tsx` - Wallet connection and signing
- `ActionButtons.tsx` - SEP-7 deep links
- `TransactionResult.tsx` - Success/failure display

### Core Functions
- `buildTransferXdr()` - Constructs Soroban transfer transactions
- `submitAndPollTransaction()` - Submits and monitors transaction status
- `validateSendParams()` - Validates URL parameters

## 🌟 Usage Example

1. **Create Link**: Visit `/` and fill out the form
2. **Share**: Copy the generated link and share on social media
3. **Send Tokens**: Recipients click the link, connect wallet, and send KALE tokens

## 🔐 Security

- Private keys never leave the user's wallet
- All signing happens in-wallet (Freighter/other)
- Parameter validation prevents malicious inputs
- Testnet only for development safety

## 🚀 Deployment

1. Set `PUBLIC_ORIGIN_DOMAIN` to your production domain
2. Build: `npm run build`
3. Deploy the `dist/` directory to your hosting provider
4. Ensure HTTPS is enabled for wallet compatibility

## 📖 References

- [Freighter Integration Guide](https://developers.stellar.org/docs/build/guides/freighter)
- [Signing Transactions with Freighter](https://developers.stellar.org/docs/build/guides/freighter/prompt-to-sign-tx)
- [Stellar Testnet](https://developers.stellar.org/docs/learn/fundamentals/networks)
