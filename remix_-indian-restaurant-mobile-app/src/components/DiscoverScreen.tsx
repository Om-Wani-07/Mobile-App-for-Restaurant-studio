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

  // Carousel slider ref & drag scroll logic
  const carouselRef = useRef<HTMLDivElement>(null);
  const cuisineContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const setupDragScroll = (el: HTMLDivElement | null) => {
      if (!el) return;
      let isDown = false;
      let isDragging = false;
      let startX: number;
      let startY: number;
      let scrollLeftOriginal: number;
      let velX = 0;
      let momentumID = 0;

      const updateMomentum = () => {
        el.scrollLeft += velX;
        velX *= 0.95; // Smooth deceleration decay
        if (Math.abs(velX) > 0.5) {
          momentumID = requestAnimationFrame(updateMomentum);
        } else {
          el.style.cursor = "grab";
        }
      };

      const handleMouseDown = (e: MouseEvent) => {
        isDown = true;
        isDragging = false;
        startX = e.pageX - el.offsetLeft;
        startY = e.pageY - el.offsetTop;
        scrollLeftOriginal = el.scrollLeft;
        cancelAnimationFrame(momentumID);
        velX = 0;
        el.style.cursor = "grabbing";
      };

      const handleMouseLeave = () => {
        if (isDown && isDragging) {
          momentumID = requestAnimationFrame(updateMomentum);
        }
        isDown = false;
        el.style.cursor = "grab";
      };

      const handleMouseUp = () => {
        isDown = false;
        if (isDragging) {
          const preventClick = (clickEvent: MouseEvent) => {
            clickEvent.stopImmediatePropagation();
            clickEvent.preventDefault();
            el.removeEventListener("click", preventClick, true);
          };
          el.addEventListener("click", preventClick, true);
          momentumID = requestAnimationFrame(updateMomentum);
        } else {
          el.style.cursor = "grab";
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;
        const x = e.pageX - el.offsetLeft;
        const y = e.pageY - el.offsetTop;
        const dist = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
        if (dist > 6) {
          isDragging = true;
        }
        if (isDragging) {
          e.preventDefault();
          const targetScrollLeft = scrollLeftOriginal - (x - startX) * 1.5;
          const prevScrollLeft = el.scrollLeft;
          el.scrollLeft = targetScrollLeft;
          velX = el.scrollLeft - prevScrollLeft; // Track current drag speed
        }
      };

      el.addEventListener("mousedown", handleMouseDown);
      el.addEventListener("mouseleave", handleMouseLeave);
      el.addEventListener("mouseup", handleMouseUp);
      el.addEventListener("mousemove", handleMouseMove);

      return () => {
        el.removeEventListener("mousedown", handleMouseDown);
        el.removeEventListener("mouseleave", handleMouseLeave);
        el.removeEventListener("mouseup", handleMouseUp);
        el.removeEventListener("mousemove", handleMouseMove);
        cancelAnimationFrame(momentumID);
      };
    };

    const cleanupCarousel = setupDragScroll(carouselRef.current);
    const cleanupCuisine = setupDragScroll(cuisineContainerRef.current);

    return () => {
      if (cleanupCarousel) cleanupCarousel();
      if (cleanupCuisine) cleanupCuisine();
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
      {/* Brand Elegant Greeting */}
      <div className="flex flex-col items-center justify-center text-center py-2 shrink-0 select-none">
        <motion.h1 
          initial={{ 
            opacity: 0, 
            y: 20, 
            letterSpacing: "-0.04em",
            textShadow: "0 0 0px rgba(212, 175, 55, 0)"
          }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            letterSpacing: "0.05em",
            textShadow: [
              "0 0 0px rgba(212, 175, 55, 0)",
              "0 0 16px rgba(212, 175, 55, 0.45)",
              "0 0 2px rgba(212, 175, 55, 0.15)"
            ]
          }}
          transition={{ 
            duration: 1.4, 
            ease: [0.16, 1, 0.3, 1],
            textShadow: { duration: 1.8, ease: "easeOut" }
          }}
          className="text-4xl font-extrabold uppercase drop-shadow-xs animate-gold-shine text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Royal India Spoon
        </motion.h1>
        <motion.div 
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 0.8, scaleX: 1 }}
          transition={{ 
            delay: 0.4, 
            duration: 1.0, 
            ease: [0.16, 1, 0.3, 1] 
          }}
          className="flex items-center gap-3 w-full max-w-[240px] mt-2 origin-center"
        >
          <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89D5E]" />
          <svg className="w-4.5 h-4.5 text-[#C89D5E] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2a10 10 0 0 1 2.5 6.5A10 10 0 0 1 12 15a10 10 0 0 1-2.5-6.5A10 10 0 0 1 12 2zm0 13a7 7 0 0 1 2 4.5A7 7 0 0 1 12 24a7 7 0 0 1-2-4.5A7 7 0 0 1 12 15zm-5-6a7 7 0 0 1 4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1-4.5 2A7 7 0 0 1 7 9.5zm10 0a7 7 0 0 1-4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1 4.5 2A7 7 0 0 1 17 9.5z" opacity="0.85" />
          </svg>
          <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89D5E]" />
        </motion.div>
      </div>

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
      <div 
        ref={cuisineContainerRef} 
        className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-2 shrink-0 cursor-grab flex gap-2.5 w-full select-none"
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
      </div>

      {/* Chef's Curated Masterpiece Specials (Horizontal Slider) */}
      <div className="flex flex-col gap-3 mt-1 shrink-0">
        <div className="flex items-center gap-2 pb-1 border-b border-amber-100/50">
          <img 
            src="/images/chef-emoji.png" 
            alt="Chef Emoji" 
            className="w-8 h-8 object-contain shrink-0 select-none"
          />
          <h2 
            className="text-[18px] font-extrabold text-[#4A1521] tracking-wide flex items-center gap-1.5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span>Chef&apos;s Signature Specials</span>
          </h2>
        </div>

        {/* Outer Carousel Container */}
        <div 
          ref={carouselRef} 
          className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 pt-2 cursor-grab flex gap-4 pb-3 select-none"
        >
          {filteredSpecials.map(item => {
            const associatedRest = restaurants.find(r => r.id === item.restaurantId);
            return (
              <motion.div 
                key={item.id}
                whileHover={{ 
                  scale: 1.03, 
                  y: -4, 
                  boxShadow: "0 12px 20px -8px rgba(200, 157, 94, 0.25)" 
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25
                }}
                whileTap={{ 
                  scale: 1.06, 
                  y: -6,
                  rotate: [0, -1, 1, 0],
                  transition: {
                    scale: { type: "spring", stiffness: 600, damping: 12 },
                    y: { type: "spring", stiffness: 650, damping: 12 },
                    rotate: { type: "tween", ease: "easeInOut", duration: 0.2 }
                  }
                }}
                onClick={() => handleSelectDish(item)}
                className="bg-white rounded-2xl border border-amber-300 p-3.5 flex flex-col gap-2 w-60 h-[175px] shrink-0 cursor-pointer group select-none ring-2 ring-amber-500/5 bg-amber-50/5 hover:border-amber-500 transition-colors duration-300"
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
        </div>
      </div>

      {/* Restaurant List Section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2 pb-1 border-b border-amber-100/50">
          <img 
            src="/images/dish-emoji.png" 
            alt="Dish Emoji" 
            className="w-8 h-8 object-contain shrink-0 select-none"
          />
          <h2 
            className="text-[18px] font-extrabold text-[#4A1521] tracking-wide flex items-center gap-1.5 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <span>Chef&apos;s Gourmet Kitchen spots</span>
          </h2>
        </div>

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
