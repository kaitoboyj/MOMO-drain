import { HeroSection } from "@/components/HeroSection";
import { TokenInfo } from "@/components/TokenInfo";
import { TradingChart } from "@/components/TradingChart";
import { LearnMore } from "@/components/LearnMore";
import { HowToUse } from "@/components/HowToUse";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Token Info Cards */}
      <div className="container mx-auto px-4">
        <TokenInfo />

        {/* Trading Chart */}
        <TradingChart />

        {/* Learn More Section */}
        <LearnMore />

        {/* How to Use Section */}
        <HowToUse />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
