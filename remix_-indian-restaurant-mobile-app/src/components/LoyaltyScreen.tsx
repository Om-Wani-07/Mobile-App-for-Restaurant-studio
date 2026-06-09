import React, { useState } from "react";
import { 
  Award, 
  Crown, 
  Sparkles, 
  HelpCircle, 
  Check, 
  Lock, 
  ChevronRight,
  Info,
  Gift
} from "lucide-react";
import { motion } from "motion/react";
import { UserLoyalty, LoyaltyReward } from "../types";

interface LoyaltyScreenProps {
  userLoyalty: UserLoyalty;
  rewardsList: LoyaltyReward[];
  selectedReward: LoyaltyReward | null;
  onSelectReward: (reward: LoyaltyReward) => boolean;
}

export default function LoyaltyScreen({
  userLoyalty,
  rewardsList,
  selectedReward,
  onSelectReward
}: LoyaltyScreenProps) {
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  const points = userLoyalty.pointsBalance;
  const careerPoints = userLoyalty.pointsEarnedTotal;
  const tier = userLoyalty.tier;

  // Next tier evaluation
  const getNextTierData = () => {
    switch (tier) {
      case "Bronze":
        return { target: 300, next: "Silver" };
      case "Silver":
        return { target: 800, next: "Gold" };
      case "Gold":
        return { target: 1500, next: "Platinum" };
      case "Platinum":
        return null;
      default:
        return { target: 300, next: "Silver" };
    }
  };

  const nextTier = getNextTierData();
  const currentTierBase = tier === "Silver" ? 300 : tier === "Gold" ? 800 : tier === "Platinum" ? 1500 : 0;
  const progressPercent = nextTier 
    ? Math.min(100, Math.max(0, ((careerPoints - currentTierBase) / (nextTier.target - currentTierBase)) * 100))
    : 100;

  const handleRedeemClick = (reward: LoyaltyReward) => {
    if (points >= reward.pointsCost) {
      const success = onSelectReward(reward);
      if (success) {
        setRedeemSuccess(reward.id);
        setTimeout(() => setRedeemSuccess(null), 4000);
      }
    }
  };

  // Tier design themes
  const getTierTheme = () => {
    switch (tier) {
      case "Platinum":
        return "from-slate-700 to-slate-900 text-white border-slate-600";
      case "Gold":
        return "from-amber-500 to-amber-700 text-white border-amber-400";
      case "Silver":
        return "from-slate-300 to-slate-400 text-slate-950 border-slate-200";
      default:
        return "from-amber-800 to-amber-950 text-white border-amber-900";
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-none bg-slate-50 [scrollbar-width:none]">
      {/* Large Royal Tier Card */}
      <div className={`p-5 rounded-3xl bg-linear-to-br ${getTierTheme()} shadow-md border flex flex-col gap-4 relative overflow-hidden`}>
        {/* Decorative backdrop graphics */}
        <div className="absolute -bottom-8 -right-8 opacity-10 rotate-12 scale-150">
          <Crown size={120} />
        </div>

        <div className="flex justify-between items-start z-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-75 font-bold">
              Royal Spoon Club
            </span>
            <span className="text-xl font-display font-extrabold tracking-tight">
              {tier} Maharaja
            </span>
          </div>
          <Crown size={24} className="opacity-90 text-amber-100" />
        </div>

        {/* Balance metrics */}
        <div className="flex items-baseline gap-1.5 z-10">
          <span className="text-3xl font-display font-black tracking-tight font-mono">
            {points}
          </span>
          <span className="text-[11px] opacity-90 font-bold uppercase tracking-wider">
            Active Points
          </span>
        </div>

        <div className="z-10 bg-black/10 rounded-2xl p-3 flex justify-between items-center text-[10px] border border-white/10 font-bold">
          <span>Life-time Earnings</span>
          <span className="font-mono">{careerPoints} pts</span>
        </div>
      </div>

      {/* Tier Progress Meter - Elegant animated status dashboard */}
      {nextTier && (
        <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm flex flex-col gap-3 relative overflow-hidden">
          {/* Subtle light background accent */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex justify-between items-center text-[11px] font-bold text-gray-800">
            <div className="flex items-center gap-1.5">
              <span className="bg-slate-100 text-slate-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">
                CURRENT: {tier}
              </span>
              <ChevronRight size={10} className="text-gray-400" />
              <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                <Crown size={10} className="fill-amber-500" /> {nextTier.next}
              </span>
            </div>
            <span className="text-[10px] text-amber-700 font-mono font-black bg-amber-50 border border-amber-100/60 px-2 py-0.5 rounded-full">
              {careerPoints} / {nextTier.target} pts
            </span>
          </div>

          {/* Progress bar line with custom tooltip, glow effect, and spring animation */}
          <div className="relative pt-1">
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50 flex items-center">
              <motion.div 
                className="h-full bg-linear-to-r from-amber-500 via-amber-600 to-amber-700 rounded-full relative"
                initial={{ width: "0%" }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ type: "spring", stiffness: 45, damping: 12, delay: 0.1 }}
              >
                {/* Glowing light streak at the edge of the bar */}
                <div className="absolute top-0 right-0 bottom-0 w-3 bg-white/40 skew-x-12 animate-pulse rounded-full" />
                {/* End thumb tip glowing indicator */}
                {progressPercent > 3 && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 h-2.5 w-2.5 bg-amber-200 rounded-full ring-2 ring-amber-600 shadow-xs shadow-amber-500/50" />
                )}
              </motion.div>
            </div>
          </div>

          <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 font-mono">
            <span>{currentTierBase} pts</span>
            <span className="text-amber-700 font-extrabold">{nextTier.target} pts (Need {nextTier.target - careerPoints} more)</span>
          </div>

          <div className="bg-amber-50/50 border border-amber-100/50 rounded-2xl p-2.5 flex items-center gap-2">
            <div className="bg-amber-500 rounded-lg p-1 text-white shrink-0">
              <Sparkles size={11} className="animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <p className="text-[10px] text-amber-900 leading-normal font-semibold">
              You are just <strong className="text-amber-700 font-bold">{nextTier.target - careerPoints} points</strong> away from becoming a <strong className="text-amber-700 font-bold">{nextTier.next} club member</strong> and unlocking higher-value dinner tokens!
            </p>
          </div>
        </div>
      )}

      {/* Redeemed success pop toast notification */}
      {redeemSuccess && (
        <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-3.5 rounded-2xl border border-emerald-150 flex items-start gap-2 shadow-xs animate-scale-in">
          <Check size={14} className="text-emerald-700 shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span>Voucher Redeemed successfully!</span>
            <span className="opacity-90 font-semibold normal-case">
              This voucher has been transferred to your active shopping cart. A discount is waiting at the checkout!
            </span>
          </div>
        </div>
      )}

      {/* Loyalty Reward Coupon Catalogs */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-bold text-gray-950 uppercase tracking-wider font-mono border-b border-gray-100 pb-1.5 flex items-center gap-1">
          <Award size={14} className="text-amber-600" />
          <span>Point Redemption Catalog</span>
        </h3>

        <div className="flex flex-col gap-3">
          {rewardsList.map(reward => {
            const isUnlocked = points >= reward.pointsCost;
            const isSelected = selectedReward?.id === reward.id;
            
            return (
              <div
                key={reward.id}
                className={`bg-white rounded-3xl border p-4 flex gap-3.5 transition-all relative ${
                  isSelected 
                    ? "border-emerald-500 bg-emerald-50/5" 
                    : isUnlocked 
                      ? "border-gray-100" 
                      : "border-gray-100 opacity-80"
                }`}
              >
                {/* Reward Icons - Star or Lock */}
                <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? "bg-emerald-50 border-emerald-150 text-emerald-600"
                    : isUnlocked
                      ? "bg-amber-50 border-amber-100 text-amber-600"
                      : "bg-slate-50 border-slate-100 text-slate-400"
                }`}>
                  {isUnlocked ? (
                    isSelected ? <Check size={18} className="stroke-[2.5]" /> : <Award size={18} />
                  ) : (
                    <Lock size={15} />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col gap-1 pr-1.5">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-xs font-bold text-gray-900 leading-tight">
                      {reward.title}
                    </h4>
                    <span className="text-[12px] font-mono font-black text-amber-700 whitespace-nowrap">
                      ★ {reward.pointsCost} pts
                    </span>
                  </div>
                  
                  <p className="text-[10px] text-gray-500 leading-relaxed">
                    {reward.description}
                  </p>

                  <div className="pt-2 mt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      ₹{reward.discountAmount} DISCOUNT
                    </span>

                    {/* Action buttons */}
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                        ✓ Applied
                      </span>
                    ) : isUnlocked ? (
                      <button
                        id={`redeem-${reward.id}`}
                        onClick={() => handleRedeemClick(reward)}
                        className="bg-amber-600 hover:bg-amber-700 text-white text-[9px] font-black px-3 py-1.5 rounded-lg border border-amber-500 transition-all cursor-pointer active:scale-95"
                      >
                        Redeem Voucher
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">
                        Need {reward.pointsCost - points} more pts
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Informative info banner */}
      <div className="bg-slate-50 border border-slate-150 rounded-2xl p-3.5 flex gap-2 text-[10px] text-gray-500 mt-2">
        <Info size={13} className="text-slate-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Order meals to earn <strong>1 loyalty point for every ₹10</strong> spent. Level up to Gold and Platinum tiers to unlock grand dinner vouchers!
        </p>
      </div>
    </div>
  );
}
