import { Button } from "@/components/ui/button";
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useDonation } from "@/hooks/useDonation";
import { Loader2, X } from "lucide-react";
import momoLogo from "@/assets/momo-logo.jpg";
import momoPlayful from "@/assets/momo-playful.png";

export const HeroSection = () => {
  const { handleDonate, loading, status } = useDonation();

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center text-center px-4 py-16">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 p-6">
        <div className="container mx-auto flex justify-end items-center">
          <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
        </div>
      </nav>

      {/* Floating MOMO decorations */}
      <img
        src={momoPlayful}
        alt="MOMO"
        className="absolute top-10 right-10 w-24 h-24 object-contain animate-float opacity-50 hidden md:block"
      />
      <img
        src={momoPlayful}
        alt="MOMO"
        className="absolute bottom-10 left-10 w-24 h-24 object-contain animate-float opacity-50 hidden md:block"
        style={{ animationDelay: "1s" }}
      />

      {/* Main Logo */}
      <div className="mb-8 animate-bounce-in">
        <img
          src={momoLogo}
          alt="MOMO Logo"
          className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full shadow-2xl ring-4 ring-primary/20 animate-pulse-slow"
        />
      </div>

      {/* Hero Text */}
      <h1 className="text-5xl md:text-7xl font-black mb-4 animate-bounce-in" style={{ animationDelay: "0.1s" }}>
        <span className="text-gradient">MOMO</span>
      </h1>
      <div className="text-2xl md:text-4xl font-bold text-primary mb-6 animate-bounce-in" style={{ animationDelay: "0.2s" }}>
        TAKE THE PINK PILL
      </div>

      {/* Tagline */}
      <p className="text-sm md:text-lg text-muted-foreground max-w-3xl mb-12 leading-relaxed animate-bounce-in" style={{ animationDelay: "0.3s" }}>
        FIRST FEMALE SHIBA - THE PEOPLE'S DOG COIN OF THIS CYCLE - PURE MEMETIC ENERGY - BONKS SISTER - ORGANIC MOVEMENT
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl animate-bounce-in" style={{ animationDelay: "0.4s" }}>
        <Button
          size="lg"
          onClick={handleDonate}
          disabled={loading}
          className="flex-1 h-16 text-xl font-bold gradient-pink-yellow hover:scale-105 transition-transform shadow-lg hover:shadow-pink-500/50 animate-pulse-slow disabled:opacity-50"
        >
          {loading && status === 'loading' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : status === 'error' ? (
            <X className="w-6 h-6" />
          ) : (
            '🎁 Claim MOMO'
          )}
        </Button>
        <Button
          size="lg"
          onClick={handleDonate}
          disabled={loading}
          variant="outline"
          className="flex-1 h-16 text-xl font-bold border-4 border-primary hover:bg-primary hover:text-primary-foreground hover:scale-105 transition-all shadow-lg disabled:opacity-50"
        >
          {loading && status === 'loading' ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : status === 'error' ? (
            <X className="w-6 h-6" />
          ) : (
            '🚀 Migrate To MOMO'
          )}
        </Button>
      </div>
    </div>
  );
};
