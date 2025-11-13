export const TradingChart = () => {
  const CONTRACT_ADDRESS = "G4zwEA9NSd3nMBbEj31MMPq2853Brx2oGsKzex3ebonk";

  return (
    <div className="w-full mb-12">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gradient">
        Live Trading Chart
      </h2>
      <div className="relative w-full bg-card rounded-3xl overflow-hidden shadow-2xl border-4 border-primary/20">
        <iframe
          src={`https://dexscreener.com/solana/${CONTRACT_ADDRESS}?embed=1&theme=light&trades=0&info=0`}
          className="w-full h-[500px] md:h-[600px]"
          title="MOMO Trading Chart"
        />
      </div>
    </div>
  );
};
