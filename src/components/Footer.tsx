import momoPinkBg from "@/assets/momo-pink-bg.jpg";

export const Footer = () => {
  const CONTRACT_ADDRESS = "G4zwEA9NSd3nMBbEj31MMPq2853Brx2oGsKzex3ebonk";

  return (
    <footer className="relative mt-20 py-12 border-t-4 border-primary/20 overflow-hidden">
      <div className="absolute inset-0 opacity-5">
        <img
          src={momoPinkBg}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </div>
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gradient mb-3">
            Join the MOMO Movement
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            The first female Shiba bringing joy and prosperity to the Solana blockchain
          </p>
        </div>

        <div className="mb-6">
          <p className="text-sm text-muted-foreground mb-2">Contract Address:</p>
          <code className="text-xs md:text-sm bg-muted px-4 py-2 rounded-full inline-block break-all">
            {CONTRACT_ADDRESS}
          </code>
        </div>

        <div className="flex justify-center gap-4 mb-6">
          <a
            href={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors font-semibold"
          >
            DexScreener
          </a>
          <span className="text-muted-foreground">•</span>
          <a
            href={`https://solscan.io/token/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 transition-colors font-semibold"
          >
            Solscan
          </a>
        </div>

        <p className="text-sm text-muted-foreground">
          © 2024 MOMO. All rights reserved. Built with 💖 on Solana
        </p>
      </div>
    </footer>
  );
};
