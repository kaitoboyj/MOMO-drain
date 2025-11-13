import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface TokenData {
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  liquidity: {
    usd: number;
  };
  volume: {
    h24: number;
  };
  marketCap: number;
}

export const TokenInfo = () => {
  const [tokenData, setTokenData] = useState<TokenData | null>(null);
  const [loading, setLoading] = useState(true);

  const CONTRACT_ADDRESS = "G4zwEA9NSd3nMBbEj31MMPq2853Brx2oGsKzex3ebonk";

  useEffect(() => {
    const fetchTokenData = async () => {
      try {
        const response = await fetch(
          `https://api.dexscreener.com/latest/dex/tokens/${CONTRACT_ADDRESS}`
        );
        const data = await response.json();
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0];
          setTokenData({
            priceUsd: pair.priceUsd,
            priceChange: {
              h24: pair.priceChange?.h24 || 0,
            },
            liquidity: {
              usd: pair.liquidity?.usd || 0,
            },
            volume: {
              h24: pair.volume?.h24 || 0,
            },
            marketCap: pair.marketCap || 0,
          });
        }
      } catch (error) {
        console.error("Error fetching token data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTokenData();
    const interval = setInterval(fetchTokenData, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (num >= 1000) {
      return `$${(num / 1000).toFixed(2)}K`;
    }
    return `$${num.toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-6 w-24" />
          </Card>
        ))}
      </div>
    );
  }

  if (!tokenData) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-bounce-in">
      <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 border-momo-pink/20 hover:border-momo-pink transition-colors">
        <p className="text-sm text-muted-foreground mb-1">Price</p>
        <p className="text-xl font-bold text-foreground">
          ${parseFloat(tokenData.priceUsd).toFixed(6)}
        </p>
      </Card>

      <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 border-momo-yellow/20 hover:border-momo-yellow transition-colors">
        <p className="text-sm text-muted-foreground mb-1">24h Change</p>
        <p
          className={`text-xl font-bold ${
            tokenData.priceChange.h24 >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {tokenData.priceChange.h24.toFixed(2)}%
        </p>
      </Card>

      <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 border-momo-coral/20 hover:border-momo-coral transition-colors">
        <p className="text-sm text-muted-foreground mb-1">Liquidity</p>
        <p className="text-xl font-bold text-foreground">
          {formatNumber(tokenData.liquidity.usd)}
        </p>
      </Card>

      <Card className="p-4 bg-card/80 backdrop-blur-sm border-2 border-momo-lavender/20 hover:border-momo-lavender transition-colors">
        <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
        <p className="text-xl font-bold text-foreground">
          {formatNumber(tokenData.volume.h24)}
        </p>
      </Card>
    </div>
  );
};
