import React, { useState, useRef, useEffect } from "react";
import { 
  Search, 
  Star, 
  Clock, 
  MapPin, 
  UtensilsCrossed, 
  ChevronRight, 
  Check, 
  Heart,
  Flame,
  User
} from "lucide-react";
import { motion } from "motion/react";
import { Restaurant, MenuItem, Review, Screen } from "../types";
import { Sparkles } from "lucide-react";
import { initialMenuItems } from "../data";

interface DiscoverScreenProps {
  restaurants: Restaurant[];
  specials: MenuItem[];
  reviews: Review[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onNavigateTo?: (screen: Screen) => void;
}

export default function DiscoverScreen({
  restaurants,
  specials,
  reviews,
  onSelectRestaurant,
  onNavigateTo
}: DiscoverScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCuisineFilter, setSelectedCuisineFilter] = useState("All");

  const handleSelectRestaurant = (rest: Restaurant) => {
    setSearchQuery("");
    if (onNavigateTo) {
      onNavigateTo({ type: "RestaurantMenu", restaurant: rest });
    } else {
      onSelectRestaurant(rest);
    }
  };

  const handleSelectDish = (dish: MenuItem) => {
    setSearchQuery("");
    const rest = restaurants.find(r => r.id === dish.restaurantId);
    if (rest) {
      if (onNavigateTo) {
        onNavigateTo({ 
          type: "RestaurantMenu", 
          restaurant: rest, 
          initialCategory: dish.category, 
          highlightItemId: dish.id 
        });
      } else {
        onSelectRestaurant(rest);
      }
    }
  };

  const matchedRestaurants = searchQuery.trim() === "" 
    ? [] 
    : restaurants.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const matchedDishes = searchQuery.trim() === "" 
    ? [] 
    : initialMenuItems.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const cuisines = ["All", "North Indian", "South Indian", "Punjabi", "Desserts"];

  const filteredSpecials = specials.filter(item => {
    if (selectedCuisineFilter === "All") return true;
    if (selectedCuisineFilter === "Desserts") {
      return item.category === "Desserts";
    }
    const associatedRest = restaurants.find(r => r.id === item.restaurantId);
    return associatedRest && associatedRest.cuisine.includes(selectedCuisineFilter);
  });

  // Carousel slider ref & drag constraints calculation
  const carouselRef = useRef<HTMLDivElement>(null);
  const cuisineContainerRef = useRef<HTMLDivElement>(null);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });

  useEffect(() => {
    const calculateConstraints = () => {
      if (carouselRef.current) {
        const totalWidth = carouselRef.current.scrollWidth;
        const visibleWidth = carouselRef.current.offsetWidth;
        setDragConstraints({
          left: Math.min(0, -(totalWidth - visibleWidth)),
          right: 0
        });
      }
    };

    calculateConstraints();
    // Re-check after short render delay to ensure images/layouts are computed
    const timer = setTimeout(calculateConstraints, 250);
    window.addEventListener("resize", calculateConstraints);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateConstraints);
    };
  }, [specials, selectedCuisineFilter, restaurants]);

  // Filter restaurants
  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.cuisine.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = selectedCuisineFilter === "All" || 
                           r.cuisine.includes(selectedCuisineFilter);

    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-5 select-none bg-slate-50 [scrollbar-width:none]">
      {/* Brand Elegant Greeting */}
      <motion.div 
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: 0.25
            }
          }
        }}
        className="flex flex-col items-center justify-center text-center py-2 shrink-0 select-none"
      >
        <motion.h1 
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1
              }
            }
          }}
          className="text-4xl font-extrabold tracking-wide uppercase drop-shadow-xs animate-gold-shine text-center flex flex-wrap justify-center gap-x-3 gap-y-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {"Royal India Spoon".toUpperCase().split(" ").map((word, wordIndex) => (
            <span key={wordIndex} className="inline-block whitespace-nowrap flex">
              {word.split("").map((char, charIndex) => (
                <motion.span
                  key={charIndex}
                  variants={{
                    hidden: { 
                      opacity: 0, 
                      y: 35,
                      rotate: 15,
                      scale: 0.8
                    },
                    show: { 
                      opacity: 1, 
                      y: 0, 
                      rotate: 0, 
                      scale: 1,
                      transition: { 
                        type: "spring",
                        damping: 10,
                        stiffness: 110
                      } 
                    }
                  }}
                  className="inline-block origin-bottom-left"
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.h1>
        <motion.div 
          variants={{
            hidden: { opacity: 0, scaleX: 0 },
            show: { 
              opacity: 0.8, 
              scaleX: 1,
              transition: { 
                duration: 0.8, 
                ease: "easeOut" 
              } 
            }
          }}
          className="flex items-center gap-3 w-full max-w-[240px] mt-2 origin-center"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89D5E]" />
          <svg className="w-4.5 h-4.5 text-[#C89D5E] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 1 2.5 6.5A10 10 0 0 1 12 15a10 10 0 0 1-2.5-6.5A10 10 0 0 1 12 2zm0 13a7 7 0 0 1 2 4.5A7 7 0 0 1 12 24a7 7 0 0 1-2-4.5A7 7 0 0 1 12 15zm-5-6a7 7 0 0 1 4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1-4.5 2A7 7 0 0 1 7 9.5zm10 0a7 7 0 0 1-4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1 4.5 2A7 7 0 0 1 17 9.5z" opacity="0.85" />
          </svg>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89D5E]" />
        </motion.div>
      </motion.div>

      {/* Styled Interactive Search Bar */}
      <div className="relative shrink-0 z-50">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
        <input 
          id="discover-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search saffron dishes, recipes, or spots..."
          className="w-full bg-white pl-10 pr-10 py-3 rounded-2xl text-xs font-medium border border-gray-100 shadow-xs focus:outline-hidden focus:ring-1 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-gray-800"
        />
        {/* Search action icon on the right side of the search bar when customer starts to type */}
        {searchQuery.trim() !== "" && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center text-amber-600 bg-amber-50 border border-amber-200/50 p-1.5 rounded-lg animate-fade-in shadow-3xs cursor-pointer hover:bg-amber-100 transition-all">
            <Search size={12} className="stroke-[2.5]" />
          </div>
        )}

        {/* Suggestions Autocomplete Panel */}
        {searchQuery.trim() !== "" && (matchedRestaurants.length > 0 || matchedDishes.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100/90 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.08)] max-h-64 overflow-y-auto z-50 p-2.5 flex flex-col gap-2 [scrollbar-width:none]">
            
            {/* Matching Restaurants Group */}
            {matchedRestaurants.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest px-1.5 py-0.5">
                  Suggested Spots ({matchedRestaurants.length})
                </span>
                {matchedRestaurants.map(r => (
                  <button
                    key={r.id}
                    onClick={() => handleSelectRestaurant(r)}
                    className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-amber-50/40 active:bg-amber-50 flex items-center justify-between gap-1.5 transition-all group cursor-pointer"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-gray-900 group-hover:text-amber-700 transition-colors truncate">
                        {r.name}
                      </span>
                      <span className="text-[10px] text-gray-400 truncate">
                        {r.cuisine}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-amber-600 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded-md shrink-0 border border-amber-100 transition-colors">
                      View Menu
                    </span>
                  </button>
                ))}
              </div>
            )}

            {matchedRestaurants.length > 0 && matchedDishes.length > 0 && (
              <div className="border-t border-gray-50 my-0.5" />
            )}

            {/* Matching Dishes Group */}
            {matchedDishes.length > 0 && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest px-1.5 py-0.5">
                  Suggested Dishes ({matchedDishes.length})
                </span>
                {matchedDishes.map(d => {
                  const r = restaurants.find(rest => rest.id === d.restaurantId);
                  return (
                    <button
                      key={d.id}
                      onClick={() => handleSelectDish(d)}
                      className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-amber-50/40 active:bg-amber-50 flex items-center justify-between gap-2.5 transition-all group cursor-pointer"
                    >
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${d.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                          <span className="text-xs font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">
                            {d.name}
                          </span>
                        </div>
                        <span className="text-[9.5px] text-gray-400 font-medium truncate">
                          <span className="font-mono font-bold text-amber-700 mr-1.5">₹{d.price}</span>
                          at {r?.name || "Kitchen"}
                        </span>
                      </div>
                      <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md shrink-0 border border-emerald-100 transition-colors">
                        Quick view
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Cuisine Tag Pill Filters with extra vertical space to avoid overflow-x clipping */}
      <div ref={cuisineContainerRef} className="overflow-hidden py-2 shrink-0 cursor-grab active:cursor-grabbing">
        <motion.div
          drag="x"
          dragConstraints={cuisineContainerRef}
          dragElastic={0.15}
          dragTransition={{ power: 0.2, timeConstant: 150 }}
          className="flex gap-2.5 w-max"
        >
          {cuisines.map(cuisine => (
            <button
              key={cuisine}
              onClick={() => setSelectedCuisineFilter(cuisine)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shrink-0 ${
                selectedCuisineFilter === cuisine
                  ? "bg-amber-600 text-white border-amber-600 shadow-sm scale-[1.02]"
                  : "bg-white text-gray-600 border-gray-100 hover:text-gray-800 hover:bg-gray-50"
              }`}
            >
              {cuisine}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Chef's Curated Masterpiece Specials (Horizontal Slider) */}
      <div className="flex flex-col gap-3 mt-1 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Custom Indian Diya (traditional oil lamp) SVG */}
            <svg className="w-8 h-8 shrink-0 select-none -mt-0.5" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 12 C55 28, 64 40, 50 54 C36 40, 45 28, 50 12 Z" fill="url(#flameGrad)" />
              <path d="M50 22 C52 31, 58 38, 50 46 C42 38, 48 31, 50 22 Z" fill="#FFF2a3" />
              <path d="M50 30 C51 36, 54 40, 50 43 C46 40, 49 36, 50 30 Z" fill="#FF5722" />
              <path d="M12 55 C12 76, 88 76, 88 55 C88 55, 76 57, 50 57 C24 57, 12 55, 12 55 Z" fill="url(#diyaGoldGrad)" stroke="#5A3A1A" strokeWidth="1.5" />
              <path d="M38 71 C38 78, 62 78, 62 71 Z" fill="#5A3A1A" />
              <ellipse cx="50" cy="74" rx="22" ry="4.5" fill="url(#diyaGoldGrad)" stroke="#5A3A1A" strokeWidth="1" />
              <path d="M22 61 C32 66, 68 66, 78 61" stroke="#F9DF95" strokeWidth="2" strokeLinecap="round" />
              <circle cx="50" cy="64" r="2.5" fill="#F9DF95" />
              <circle cx="36" cy="62.5" r="2" fill="#F9DF95" />
              <circle cx="64" cy="62.5" r="2" fill="#F9DF95" />
              <defs>
                <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FFFBE6" />
                  <stop offset="25%" stopColor="#FFD54F" />
                  <stop offset="65%" stopColor="#FF5722" />
                  <stop offset="100%" stopColor="#E64A19" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="diyaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#C89D5E" />
                  <stop offset="45%" stopColor="#F3DCA2" />
                  <stop offset="100%" stopColor="#8C5D3A" />
                </linearGradient>
              </defs>
            </svg>
            <h2 
              className="text-[17px] font-bold text-[#0F1E36] tracking-wide flex items-center gap-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span>Chef&apos;s Signature Specials</span>
              <svg className="w-[22px] h-[22px] text-[#8C6239] shrink-0 self-center ml-0.5" viewBox="0 0 100 100" fill="currentColor">
                {/* Fork */}
                <path d="M 28 50 L 27 75 C 26 81, 28 86, 31 86 C 34 86, 36 81, 35 75 L 34 50 C 34 45, 42 44, 42 38 L 42 16 C 42 15, 40 15, 40 16 L 40 33 L 37 33 L 37 16 C 37 15, 35 15, 35 16 L 35 33 L 32 33 L 32 16 C 32 15, 30 15, 30 16 L 30 33 L 27 33 L 27 16 C 27 15, 25 15, 25 16 L 25 38 C 25 44, 28 45, 28 50 Z" />
                {/* Knife */}
                <path d="M 68 50 L 67 75 C 66 81, 68 86, 71 86 C 74 86, 76 81, 75 75 L 74 50 C 74 46, 75 42, 75 35 C 75 25, 74 18, 71 16 C 70 15, 68 15, 68 17 C 68 22, 67 30, 67 38 C 67 44, 68 46, 68 50 Z" />
              </svg>
            </h2>
          </div>
        </div>

        {/* Outer Carousel Container */}
        <div 
          ref={carouselRef} 
          className="overflow-hidden -mx-4 px-4 cursor-grab active:cursor-grabbing"
        >
          <motion.div 
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.15}
            dragTransition={{ power: 0.2, timeConstant: 150 }}
            className="flex gap-4 pb-3"
          >
            {filteredSpecials.map(item => {
              const associatedRest = restaurants.find(r => r.id === item.restaurantId);
              const isGrandRoyal = item.name === "Grand Royal Butter Chicken";
              return (
                <motion.div 
                  key={item.id}
                  whileHover={
                    isGrandRoyal 
                      ? { scale: 1.03, y: -4, boxShadow: "0 12px 20px -8px rgba(217, 119, 6, 0.25)" } 
                      : { scale: 1.01, y: -1 }
                  }
                  whileTap={
                    isGrandRoyal 
                      ? { 
                          scale: 1.06, 
                          y: -6,
                          rotate: [0, -1, 1, 0],
                          transition: {
                            scale: { type: "spring", stiffness: 600, damping: 12 },
                            y: { type: "spring", stiffness: 650, damping: 12 },
                            rotate: { type: "tween", ease: "easeInOut", duration: 0.2 }
                          }
                        } 
                      : { scale: 0.97 }
                  }
                  onClick={() => associatedRest && onSelectRestaurant(associatedRest)}
                  className={`bg-white rounded-2xl border p-3.5 flex flex-col gap-2 w-60 h-[175px] shrink-0 cursor-pointer group select-none ${
                    isGrandRoyal 
                      ? "border-amber-300 ring-2 ring-amber-500/5 bg-amber-50/5" 
                      : "border-gray-100/80 shadow-xs"
                  }`}
                >
                  {/* Special Tag badge */}
                  <div className="flex justify-between items-center">
                    <span className={`h-2.5 w-2.5 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"} ring-4 ring-slate-100`} />
                    <span className="text-[9px] bg-amber-50 border border-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-md">
                      ★ {item.rating}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-extrabold text-gray-900 group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug min-h-[32px]">
                      {item.name}
                    </h3>
                    <span className="text-[10px] font-mono text-gray-400">
                      {associatedRest?.name || "Kitchen Specialist"}
                    </span>
                  </div>

                  <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  <div className="mt-auto pt-2 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-amber-700">
                      ₹{item.price}
                    </span>
                    <div className="text-[10px] bg-slate-50 px-2.5 py-0.5 rounded-md font-semibold text-gray-650 flex items-center gap-0.5">
                      <span>View Menu</span>
                      <ChevronRight size={10} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      {/* Restaurant List Section */}
      <div className="flex flex-col gap-3">
        <h2 
          className="text-[17px] font-bold text-[#0F1E36] tracking-wide flex items-center gap-1"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span>Chef&apos;s Gourmet Kitchen spots</span>
          <svg className="w-[22px] h-[22px] text-[#8C6239] shrink-0 self-center ml-0.5" viewBox="0 0 100 100" fill="currentColor">
            {/* Fork */}
            <path d="M 28 50 L 27 75 C 26 81, 28 86, 31 86 C 34 86, 36 81, 35 75 L 34 50 C 34 45, 42 44, 42 38 L 42 16 C 42 15, 40 15, 40 16 L 40 33 L 37 33 L 37 16 C 37 15, 35 15, 35 16 L 35 33 L 32 33 L 32 16 C 32 15, 30 15, 30 16 L 30 33 L 27 33 L 27 16 C 27 15, 25 15, 25 16 L 25 38 C 25 44, 28 45, 28 50 Z" />
            {/* Knife */}
            <path d="M 68 50 L 67 75 C 66 81, 68 86, 71 86 C 74 86, 76 81, 75 75 L 74 50 C 74 46, 75 42, 75 35 C 75 25, 74 18, 71 16 C 70 15, 68 15, 68 17 C 68 22, 67 30, 67 38 C 67 44, 68 46, 68 50 Z" />
          </svg>
        </h2>

        {filteredRestaurants.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2">
            <UtensilsCrossed size={32} className="text-gray-300 stroke-1" />
            <span className="text-xs font-bold text-gray-600">No restaurants match your search</span>
            <span className="text-[10px] text-gray-400">Try modifying your filter categories</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredRestaurants.map(rest => (
              <div
                key={rest.id}
                id={`restaurant-card-${rest.id}`}
                onClick={() => onSelectRestaurant(rest)}
                className="bg-white rounded-3xl border border-gray-100 shadow-xs group cursor-pointer overflow-hidden hover:shadow-md transition-all flex flex-col hover:border-amber-100/60"
              >
                {/* Image Section */}
                <div className="h-32 w-full relative overflow-hidden bg-slate-200">
                  <img 
                    src={rest.imageUrl} 
                    alt={rest.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-3.5">
                    <span className="text-white text-base font-display font-extrabold tracking-tight leading-tight">
                      {rest.name}
                    </span>
                    <span className="text-[10px] text-amber-200/90 font-medium">
                      {rest.cuisine}
                    </span>
                  </div>
                  {/* Floating Rating Badge */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-xl shadow-md border border-white flex items-center gap-1">
                    <Star size={11} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-mono font-black text-gray-800">
                      {rest.rating}
                    </span>
                    <span className="text-[9px] text-gray-400 font-bold">
                      ({rest.reviewCount})
                    </span>
                  </div>
                </div>

                {/* Info Bar */}
                <div className="p-3.5 flex flex-col gap-1 text-xs">
                  <p className="text-[11px] font-semibold text-gray-600 italic">
                    &ldquo;{rest.tagline}&rdquo;
                  </p>
                  
                  <div className="flex justify-between items-center mt-2.5 pt-2.5 border-t border-gray-50 text-[10px] text-gray-500 font-bold">
                    <div className="flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" />
                      <span>{rest.deliveryTime}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={11} className="text-slate-400 line-clamp-1" />
                      <span>{rest.address.split(",").slice(-2).join(",").trim()}</span>
                    </div>
                    <span className="text-amber-700 font-mono">{rest.costForTwo}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Community review activity feed highlight */}
      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 flex flex-col gap-2.5">
        <h3 
          className="text-[13px] font-bold text-amber-900 tracking-wide flex items-center gap-1.5"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <User size={14} className="text-amber-700" />
          <span>Local Foodie Talk</span>
        </h3>
        
        {reviews.slice(0, 1).map(rev => (
          <div key={rev.id} className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-[10px]">
              <span className="font-bold text-gray-700">{rev.userName}</span>
              <div className="flex gap-0.5">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} size={8} className="text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
            <p className="text-[10px] text-gray-600 leading-relaxed font-medium">
              &ldquo;{rev.comment}&rdquo;
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
