import React, { useState, useTransition, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  Leaf, 
  MapPin, 
  Flame, 
  Check, 
  Star, 
  MessageSquare, 
  Plus, 
  Minus, 
  BookOpen, 
  Send,
  SlidersHorizontal
} from "lucide-react";
import { motion } from "motion/react";
import { Restaurant, MenuItem, Review, Screen } from "../types";

interface RestaurantMenuScreenProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
  cart: { [itemId: number]: number };
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onNavigateTo: (screen: Screen) => void;
  onNavigateBack: () => void;
  reviews: Review[];
  onAddReview: (
    restaurantId: number,
    menuItemId: number | null,
    menuItemName: string | null,
    userName: string,
    rating: number,
    comment: string
  ) => void;
  initialCategory?: string;
  highlightItemId?: number;
}

export default function RestaurantMenuScreen({
  restaurant,
  menuItems,
  cart,
  onAddToCart,
  onRemoveFromCart,
  onNavigateTo,
  onNavigateBack,
  reviews,
  onAddReview,
  initialCategory,
  highlightItemId
}: RestaurantMenuScreenProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || "Starters");
  const [vegOnly, setVegOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "reviews">("menu");
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  // New Review Form States
  const [isPending, startTransition] = useTransition();
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const categories = ["Starters", "Mains", "Biryani", "Breads", "Desserts"];

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = item.category === selectedCategory;
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesCategory && matchesVeg;
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;

    startTransition(() => {
      onAddReview(
        restaurant.id,
        null,
        null,
        reviewName.trim(),
        reviewRating,
        reviewComment.trim()
      );
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col select-none bg-slate-50 relative">
      {/* Scrollable container for menu contents */}
      <div className="flex-1 overflow-y-auto [scrollbar-width:none]">
        {/* Banner with absolute Header */}
        <div className="h-44 w-full relative">
          <img 
            src={restaurant.imageUrl} 
            alt={restaurant.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover brightness-75"
          />
          {/* Absolute Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          {/* Back Arrow */}
          <button
            id="menu-back-btn"
            onClick={onNavigateBack}
            className="absolute top-4 left-4 bg-white/95 text-gray-800 p-2 rounded-full shadow-md hover:bg-white active:scale-95 transition-all"
          >
            <ArrowLeft size={16} />
          </button>

          {/* Book Table Action Button */}
          <button
            id={`book-table-btn-${restaurant.id}`}
            onClick={() => onNavigateTo({ type: "TableBookingScreen", restaurant })}
            className="absolute top-4 right-4 bg-amber-600 text-white text-[10px] font-bold px-3.5 py-2 rounded-xl shadow-md border border-amber-500 flex items-center gap-1 hover:bg-amber-700 transition-all active:scale-95"
          >
            <span>Book Table</span>
          </button>

          {/* Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col">
            <span className="text-xl font-display font-extrabold tracking-tight pb-0.5">
              {restaurant.name}
            </span>
            <span className="text-[10px] text-amber-200 font-medium">
              {restaurant.cuisine}
            </span>
            <div className="flex items-center gap-3 mt-1.5 text-[9px] text-gray-300 font-bold">
              <span className="flex items-center gap-0.5 text-white bg-amber-600 px-1.5 py-0.5 rounded-sm">
                ★ {restaurant.rating}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <MapPin size={9} />
                {restaurant.address.split(",")[0]}
              </span>
              <span>•</span>
              <span>{restaurant.deliveryTime}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection: Menu or Reviews */}
        <div className="bg-white border-b border-gray-100 flex p-1">
          <button
            id="menu-tab-btn"
            onClick={() => setActiveTab("menu")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "menu"
                ? "border-amber-600 text-amber-700 bg-amber-50/10"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <BookOpen size={13} />
            <span>Spiced Menu</span>
          </button>
          <button
            id="reviews-tab-btn"
            onClick={() => setActiveTab("reviews")}
            className={`flex-1 py-3 text-xs font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
              activeTab === "reviews"
                ? "border-amber-600 text-amber-700 bg-amber-50/10"
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            <MessageSquare size={13} />
            <span>Reviews ({reviews.length})</span>
          </button>
        </div>

        {/* Screen Switch: MENU */}
        {activeTab === "menu" ? (
          <div className="flex flex-col gap-4 p-4 pb-20">
            {/* Category selection and filters inline */}
            <div className="flex items-center justify-between gap-4">
              {/* Category slider list */}
              <div ref={categoryContainerRef} className="overflow-hidden pb-1 flex-1 cursor-grab active:cursor-grabbing">
                <motion.div
                  drag="x"
                  dragConstraints={categoryContainerRef}
                  dragElastic={0.15}
                  dragTransition={{ power: 0.2, timeConstant: 150 }}
                  className="flex gap-2.5 w-max"
                >
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all border shrink-0 ${
                        selectedCategory === cat
                          ? "bg-amber-600 border-amber-600 text-white shadow-xs"
                          : "bg-white border-gray-100 text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              </div>

              {/* Vegetarian Only Switcher */}
              <button
                id="menu-veg-filter"
                onClick={() => setVegOnly(!vegOnly)}
                className={`p-2 rounded-xl border flex items-center justify-center transition-all ${
                  vegOnly 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                    : "bg-white border-gray-200 text-gray-400 hover:text-gray-600"
                }`}
                title="Vegetarian Only"
              >
                <Leaf size={14} className={vegOnly ? "fill-emerald-600/25" : ""} />
              </button>
            </div>

            {/* Structured Dishes Listing */}
            {filteredItems.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2">
                <SlidersHorizontal size={28} className="text-gray-300 stroke-1" />
                <span className="text-xs font-bold text-gray-600">No dishes match selected filters</span>
                <span className="text-[10px] text-gray-400">Try switching your category or disabling Veg-Only</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredItems.map(item => {
                  const qtyInCart = cart[item.id] || 0;
                  const isHighlighted = item.id === highlightItemId;
                  return (
                    <motion.div 
                      key={item.id}
                      initial={isHighlighted ? { scale: 0.98, borderColor: "rgba(217,119,6,0.8)" } : undefined}
                      animate={isHighlighted ? { 
                        scale: [1, 1.03, 1],
                        borderColor: ["rgba(217,119,6,0.3)", "rgba(217,119,6,1)", "rgba(217,119,6,0.3)"],
                      } : undefined}
                      transition={isHighlighted ? { repeat: 2, duration: 1.2 } : undefined}
                      className={`rounded-3xl border p-3 shadow-2xs flex gap-3 transition-all hover:border-amber-100 ${
                        isHighlighted 
                          ? "bg-amber-50/20 border-amber-500 ring-2 ring-amber-500/20 font-medium" 
                          : "bg-white border-gray-50"
                      }`}
                    >
                      {/* Left: Dish Image */}
                      {item.imageUrl && (
                        <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-2xl overflow-hidden shadow-sm border border-gray-100 self-start">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}

                      {/* Middle: Food Indicator & Details */}
                      <div className="flex-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          {/* Authentic Veg / Non-Veg Border Indicator */}
                          <div className={`h-3 w-3 border flex items-center justify-center p-0.5 rounded-sm ${item.isVeg ? "border-emerald-600" : "border-rose-600"}`}>
                            <div className={`h-1.5 w-1.5 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                          </div>
                          
                          {/* Best Seller / Popular Banner */}
                          {item.isPopular && (
                            <span className="text-[8px] bg-rose-50 border border-rose-100 text-rose-600 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                              Popular
                            </span>
                          )}

                          {/* Owner Special Indicator */}
                          {item.isSpecial && (
                            <span className="text-[8px] bg-amber-100 border border-amber-200 text-amber-700 font-extrabold px-1.5 py-0.5 rounded-md uppercase">
                              Special
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col">
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {item.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-amber-800">
                            ₹{item.price}
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-500 leading-relaxed font-normal">
                          {item.description}
                        </p>

                        {/* Additional labels: Spice, Rating */}
                        <div className="flex items-center gap-3 mt-1 text-[9px] text-gray-400 font-bold">
                          <span className="flex items-center gap-0.5">
                            ★ {item.rating} <span className="text-[8px] text-gray-300">({item.reviewCount})</span>
                          </span>
                          
                          <div className="flex items-center gap-0.5 text-amber-600">
                            <Flame size={10} className="fill-amber-600/10" />
                            <span>
                              {item.spiceLevel === 1 ? "Mild" : item.spiceLevel === 2 ? "Medium" : "Fiery"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Plus Minus Controls */}
                      <div className="w-20 flex flex-col items-center justify-center shrink-0">
                        {qtyInCart === 0 ? (
                          <button
                            id={`add-to-cart-${item.id}`}
                            onClick={() => onAddToCart(item)}
                            className="w-full bg-white text-emerald-600 border border-emerald-200/80 hover:bg-emerald-50 text-[11px] font-extrabold py-1.5 rounded-xl transition-all shadow-3xs flex items-center justify-center gap-0.5 hover:scale-102 active:scale-95"
                          >
                            <Plus size={12} />
                            <span>ADD</span>
                          </button>
                        ) : (
                          <div className="w-full bg-emerald-600 text-white text-[11px] font-extrabold rounded-xl py-1 px-1.5 flex justify-between items-center shadow-md border border-emerald-700 animate-scale-in">
                            <button
                              id={`remove-from-cart-${item.id}`}
                              onClick={() => onRemoveFromCart(item)}
                              className="hover:bg-emerald-700 p-1.5 rounded-lg active:scale-80 transition-all text-white/90"
                            >
                              <Minus size={11} className="stroke-[3]" />
                            </button>
                            <span className="font-mono text-center font-bold px-1.5">
                              {qtyInCart}
                            </span>
                            <button
                              id={`add-qty-${item.id}`}
                              onClick={() => onAddToCart(item)}
                              className="hover:bg-emerald-700 p-1.5 rounded-lg active:scale-80 transition-all text-white/90"
                            >
                              <Plus size={11} className="stroke-[3]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Screen Switch: REVIEWS VIEW */
          <div className="flex flex-col gap-5 p-4 pb-20">
            {/* Reviews list */}
            <div className="flex flex-col gap-3">
              <h3 className="text-xs font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase tracking-wider font-mono">
                Recent Dining Feedback
              </h3>
              
              {reviews.length === 0 ? (
                <div className="p-6 bg-white border border-gray-100 rounded-3xl text-center text-xs text-gray-400">
                  No reviews submitted yet. Be the first to review!
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {reviews.map(rev => (
                    <div key={rev.id} className="bg-white rounded-2xl border border-gray-100 shadow-3xs p-3.5 flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-800">{rev.userName}</span>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={9} 
                              className={i < rev.rating ? "text-amber-500 fill-amber-500" : "text-gray-200"} 
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 font-mono">
                        {new Date(rev.timestamp).toLocaleDateString()}
                      </p>
                      <p className="text-[11px] text-gray-600 leading-relaxed font-normal mt-1">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Write a review forms */}
            <form onSubmit={handleReviewSubmit} className="bg-white border border-gray-100 rounded-3xl p-4 flex flex-col gap-3 shadow-xs">
              <h3 className="text-xs font-bold text-gray-950 flex items-center gap-1.5">
                <SlidersHorizontal size={12} className="text-amber-600" />
                <span>Write a Review</span>
              </h3>

              {submitSuccess && (
                <div className="bg-emerald-50 text-emerald-700 text-[10px] font-bold p-2.5 rounded-xl border border-emerald-150 animate-fade-in">
                  ✓ Review submitted! Thank you for the gourmet feedback.
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Your Full name</label>
                <input 
                  id="review-name-input"
                  type="text"
                  required
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                  className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              {/* Rating Star select */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="transition-all active:scale-75 cursor-pointer"
                    >
                      <Star 
                        size={20} 
                        className={star <= reviewRating ? "text-amber-500 fill-amber-500" : "text-gray-200"} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-gray-400">Comment</label>
                <textarea 
                  id="review-comment-input"
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Tell others how is the food quality, spice details, or table service..."
                  rows={2}
                  className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
                />
              </div>

              <button
                id="submit-review-btn"
                type="submit"
                disabled={isPending}
                className="w-full bg-amber-600 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1 hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
              >
                <Send size={12} />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Floating Checkout bar when cart has items of this restaurant */}
      {Object.values(cart).some(q => q > 0) && (
        <div className="absolute bottom-4 left-4 right-4 bg-emerald-600 text-white p-3.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-emerald-500 flex justify-between items-center z-50 animate-slide-up">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono uppercase font-bold text-emerald-100 leading-none">
              {Object.values(cart).reduce((a, b) => a + b, 0)} Items Added
            </span>
            <span className="text-xs font-bold font-display select-none">
              Checkout & Redemption Available
            </span>
          </div>

          <button
            id="view-cart-button"
            onClick={() => onNavigateTo({ type: "Cart" })}
            className="bg-white text-emerald-700 text-xs font-extrabold px-3.5 py-2 rounded-xl border border-white hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-0.5"
          >
            <span>View Cart</span>
            <ArrowLeft size={11} className="rotate-180" />
          </button>
        </div>
      )}
    </div>
  );
}
