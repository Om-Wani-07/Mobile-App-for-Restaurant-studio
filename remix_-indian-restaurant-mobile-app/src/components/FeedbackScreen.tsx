import React, { useState } from "react";
import { 
  Star, 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  MessageSquare, 
  ThumbsUp, 
  Sparkles, 
  UtensilsCrossed, 
  MapPin,
  Clock,
  Heart
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FoodOrder, Screen } from "../types";

interface FeedbackScreenProps {
  orderId: number;
  orders: FoodOrder[];
  onAddReview: (
    restaurantId: number,
    menuItemId: number | null,
    menuItemName: string | null,
    userName: string,
    rating: number,
    comment: string
  ) => void;
  onNavigateTo: (screen: Screen) => void;
  onNavigateBack: () => void;
}

export default function FeedbackScreen({
  orderId,
  orders,
  onAddReview,
  onNavigateTo,
  onNavigateBack
}: FeedbackScreenProps) {
  const order = orders.find(o => o.id === orderId);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [additionalComments, setAdditionalComments] = useState<string>("");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Fallback in case order is not found
  if (!order) {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-3">
        <ArrowLeft size={24} className="text-gray-400 cursor-pointer" onClick={onNavigateBack} />
        <span className="text-xs font-bold text-gray-750">Order ref not found</span>
        <button onClick={onNavigateBack} className="text-xs font-bold text-amber-600">
          Return of orders
        </button>
      </div>
    );
  }

  // Dynamic feedback templates based on rating selection (positive vs critical)
  const positiveTemplates = [
    "Taste was amazing! 🍕",
    "Super fast delivery! ⚡",
    "Perfect packaging 📦",
    "Spicy & delicious! 🔥",
    "Good portion size! 🍛",
    "Value for money 💸",
    "Loved the freshness! 🌿",
    "Warm and fresh! 👑"
  ];

  const criticalTemplates = [
    "Food was cold ❄️",
    "Delivery delayed ⏳",
    "Too spicy 🌶️",
    "Missing cutlery/item 🍴",
    "Oily / salty 🧂",
    "Smells average 🥣",
    "Packaging issue 📦",
    "Portion too small 🤏"
  ];

  const currentTemplates = rating >= 4 ? positiveTemplates : criticalTemplates;

  // Toggle feedback template click
  const handleTemplateToggle = (tpl: string) => {
    let nextTemplates = [...selectedTemplates];
    if (nextTemplates.includes(tpl)) {
      nextTemplates = nextTemplates.filter(t => t !== tpl);
    } else {
      nextTemplates.push(tpl);
    }
    setSelectedTemplates(nextTemplates);

    // Auto update additional comments with tags formatted cleanly
    const cleanedTemplatesStr = nextTemplates.join(", ");
    setAdditionalComments((prev) => {
      // Find what part of the previous comment was templates or just append
      return cleanedTemplatesStr;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalComment = additionalComments.trim() || selectedTemplates.join(", ") || "No additional comments shared.";
    
    // Add custom restaurant review to the app state
    onAddReview(
      order.restaurantId,
      null,
      null,
      "Royal Foodie", // Standard customer username for ease
      rating,
      finalComment
    );

    // Save order in localized Rated list so UI knows it was rated
    const previouslyRated = localStorage.getItem("rsl_completed_ratings");
    const ratedList = previouslyRated ? JSON.parse(previouslyRated) : [];
    if (!ratedList.includes(orderId)) {
      ratedList.push(orderId);
      localStorage.setItem("rsl_completed_ratings", JSON.stringify(ratedList));
    }

    setIsSubmitted(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-none bg-slate-50 [scrollbar-width:none]">
      {/* Header navigations */}
      <div className="flex items-center gap-3 shrink-0">
        <button 
          id="feedback-back-btn"
          onClick={onNavigateBack} 
          className="p-1.5 bg-white border border-gray-150 text-gray-700 rounded-lg active:scale-90 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
            Share Royal Review
          </h1>
          <span className="text-[10px] font-mono font-bold text-amber-700">
            For Order ID: #RSL-{order.id}
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="feedback-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4"
          >
            {/* Restaurant brand Card overview */}
            <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-700 shrink-0">
                <UtensilsCrossed size={18} />
              </div>
              <div className="flex flex-col flex-1 leading-tight min-w-0">
                <h2 className="text-xs font-black text-gray-800 truncate">
                  {order.restaurantName}
                </h2>
                <span className="text-[9px] text-gray-400 font-medium truncate mt-0.5">
                  {order.itemsSummary}
                </span>
                <span className="text-[8px] font-mono font-bold text-slate-400 mt-1">
                  Placed on {new Date(order.timestamp).toLocaleDateString()} at {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Core Interactive rating block */}
            <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-3xs flex flex-col items-center text-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-wider">
                  How was your culinary feast?
                </span>
                <span className="text-sm font-extrabold text-gray-800">
                  {rating === 5 && "Exquisite Royalty! 👑"}
                  {rating === 4 && "Tasty & Delightful! ⭐"}
                  {rating === 3 && "Decent Satisfaction ⭐"}
                  {rating === 2 && "Could be better 🥣"}
                  {rating === 1 && "Extremely disappointed ❄️"}
                </span>
              </div>

              {/* Stars sequence with micro animations */}
              <div className="flex gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isActive = (hoverRating !== null ? star <= hoverRating : star <= rating);
                  return (
                    <motion.button
                      type="button"
                      key={star}
                      onClick={() => {
                        setRating(star);
                        setSelectedTemplates([]); // Reset templates on change of rating direction
                        setAdditionalComments("");
                      }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      whileHover={{ scale: 1.25, rotate: 8 }}
                      whileTap={{ scale: 0.9 }}
                      className="cursor-pointer"
                    >
                      <Star 
                        size={32} 
                        className={`transition-all duration-150 ${
                          isActive 
                            ? "fill-gradient-yellow text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.25)]" 
                            : "text-gray-200"
                        }`} 
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Common Feedback templates prompt block */}
            <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-gray-450 font-mono tracking-wider">
                  Tap feedback templates
                </span>
                <span className="text-[8px] font-medium text-gray-400 flex items-center gap-0.5">
                  <Heart size={8} className="fill-rose-400 text-rose-400 animate-pulse" /> Easy multi-select
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentTemplates.map((tpl) => {
                  const isSelected = selectedTemplates.includes(tpl);
                  return (
                    <motion.button
                      type="button"
                      key={tpl}
                      onClick={() => handleTemplateToggle(tpl)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-full border transition-all cursor-pointer flex items-center ${
                        isSelected 
                          ? "bg-amber-600 border-amber-600 text-white shadow-xs" 
                          : "bg-slate-50 border-gray-100 text-gray-700 hover:bg-slate-100"
                      }`}
                    >
                      {tpl}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Written Comments Block Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-gray-450 font-mono tracking-wider flex items-center gap-1">
                  <MessageSquare size={10} /> Extra kitchen notes (or auto-filled values)
                </label>
                <textarea
                  value={additionalComments}
                  onChange={(e) => setAdditionalComments(e.target.value)}
                  placeholder="Share details of delivery speed, chef aroma, spice counts, or portion value..."
                  className="w-full text-xs font-semibold text-gray-700 bg-slate-50 rounded-2xl p-3 border border-gray-100 outline-none focus:border-amber-400 focus:bg-white transition-all h-24 resize-none"
                  maxLength={250}
                />
                <div className="flex justify-end text-[8px] text-gray-400 font-mono font-bold">
                  {additionalComments.length}/250 chars
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 border border-amber-500 shadow-sm shadow-amber-600/10"
              >
                <Send size={12} />
                <span>Submit Palace Review</span>
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="feedback-success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="bg-white rounded-4xl border border-gray-150 p-6 flex flex-col items-center text-center gap-4 shadow-md py-10"
          >
            <div className="h-16 w-16 bg-emerald-50 rounded-3xl flex items-center justify-center text-emerald-600 mb-2 relative">
              <CheckCircle2 size={36} className="relative z-10" />
              <motion.div 
                className="absolute inset-0 rounded-3xl bg-emerald-100" 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>

            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-black text-gray-800">
                Palace Review Accepted!
              </h2>
              <p className="text-[10px] text-gray-500 leading-relaxed max-w-[220px] mx-auto">
                Thank you for rating. Your gourmet insights elevate chef standards and reward delivery riders with prestige!
              </p>
            </div>

            <p className="text-[9px] bg-slate-50 border border-slate-100/60 px-3 py-1.5 rounded-xl font-bold text-gray-650 max-w-[200px]">
              &ldquo;{additionalComments.trim() || selectedTemplates.join(", ") || "Excellent service experience"}&rdquo;
            </p>

            <div className="flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 font-mono mt-2 bg-emerald-50/50 px-2.5 py-1 rounded">
              <Sparkles size={8} /> Saved in Imperial Archives
            </div>

            <button
              onClick={() => onNavigateTo({ type: "OrdersList" })}
              className="mt-4 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs px-5 py-2.5 rounded-2xl cursor-pointer transition-all active:scale-95 border border-slate-800"
            >
              Back to Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
