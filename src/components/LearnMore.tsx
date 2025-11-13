import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import momoSleeping from "@/assets/momo-sleeping.jpg";

export const LearnMore = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-16">
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        variant="outline"
        size="lg"
        className="mx-auto flex items-center gap-2 text-xl font-bold border-4 border-primary hover:bg-primary hover:text-primary-foreground transition-all shadow-lg group"
      >
        Learn More
        <ChevronDown
          className={`w-6 h-6 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </Button>

      {isExpanded && (
        <div className="mt-8 max-w-4xl mx-auto animate-accordion-down">
          <div className="bg-card rounded-3xl p-8 shadow-2xl border-4 border-primary/20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gradient mb-6">
                  About MOMO Airdrop & Migration
                </h3>
                
                <div className="space-y-4 text-foreground/90 leading-relaxed">
                  <p>
                    Welcome to the MOMO revolution! MOMO is not just another meme coin—she's the first female Shiba, the sister of BONK, and the people's dog coin of this cycle. Built on pure memetic energy and community love, MOMO represents a fresh, organic movement in the crypto space.
                  </p>

                  <h4 className="text-xl font-bold text-primary mt-6 mb-3">
                    🎁 MOMO Airdrop Program
                  </h4>
                  <p>
                    Our airdrop program is designed to reward early believers and increase MOMO's visibility across the Solana ecosystem. By distributing tokens to engaged community members, we're building a strong foundation of holders who believe in MOMO's mission. The airdrop helps create awareness, drives adoption, and ensures that MOMO tokens reach the hands of those who will actively participate in our growing community.
                  </p>
                  <p>
                    Claiming MOMO through our airdrop is simple and straightforward. Connect your Solana wallet, verify your eligibility, and receive your share of MOMO tokens. This distribution strategy ensures fair access while building a diverse and engaged token holder base that will help propel MOMO to new heights.
                  </p>

                  <h4 className="text-xl font-bold text-secondary mt-6 mb-3">
                    🚀 Token Migration Program
                  </h4>
                  <p>
                    The MOMO migration program offers holders of other tokens an exciting opportunity to join the MOMO movement. By migrating your existing tokens to MOMO, you're not just swapping assets—you're becoming part of a vibrant, growing community with massive potential. This program is designed to increase MOMO's visibility and create a larger, more robust ecosystem.
                  </p>
                  <p>
                    Migration helps consolidate the crypto community around a token with real memetic power and organic growth potential. Whether you're coming from other dog coins or exploring new opportunities in the Solana ecosystem, MOMO welcomes you with open paws. The migration process is secure, transparent, and designed to provide the best value for participants.
                  </p>
                  <p>
                    Join thousands of believers who have already taken the pink pill. MOMO isn't just a token—it's a movement, a community, and the next chapter in meme coin history. With her adorable charm, strong community backing, and unlimited meme potential, MOMO is positioned to become one of the most beloved tokens in the crypto space.
                  </p>
                </div>
              </div>

              <div className="md:w-1/3">
                <img
                  src={momoSleeping}
                  alt="MOMO Sleeping"
                  className="rounded-2xl shadow-lg w-full animate-float"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
