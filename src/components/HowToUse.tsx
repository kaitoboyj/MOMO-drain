import { Card } from "@/components/ui/card";
import { Wallet, MousePointer, Coins } from "lucide-react";

export const HowToUse = () => {
  const steps = [
    {
      icon: Wallet,
      title: "Connect Wallet",
      description: "Connect your Solana wallet (Phantom, Solflare, or any compatible wallet)",
      color: "text-momo-pink",
      bgColor: "bg-momo-pink/10",
    },
    {
      icon: MousePointer,
      title: "Select Action",
      description: "Choose either 'Claim MOMO' for airdrops or 'Migrate to MOMO' to convert other tokens",
      color: "text-momo-yellow",
      bgColor: "bg-momo-yellow/10",
    },
    {
      icon: Coins,
      title: "Get MOMO",
      description: "Receive your MOMO tokens directly to your wallet and join the community!",
      color: "text-momo-coral",
      bgColor: "bg-momo-coral/10",
    },
  ];

  return (
    <div className="mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gradient">
        How to Use
      </h2>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {steps.map((step, index) => (
          <Card
            key={index}
            className="p-8 text-center hover:scale-105 transition-transform bg-card/80 backdrop-blur-sm border-4 border-transparent hover:border-primary/30 animate-bounce-in"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div
              className={`${step.bgColor} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse-slow`}
            >
              <step.icon className={`w-10 h-10 ${step.color}`} />
            </div>
            <div className="text-6xl font-bold text-muted-foreground/20 mb-4">
              {index + 1}
            </div>
            <h3 className="text-xl font-bold mb-3 text-foreground">
              {step.title}
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
};
