import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  TrendingUp, 
  ShoppingBag, 
  CalendarDays, 
  Layers, 
  Search, 
  Check, 
  ChefHat, 
  Info,
  LogOut,
  User,
  Clock,
  MapPin,
  MessageSquare,
  MessageCircleReply,
  Store,
  CalendarCheck,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Utensils,
  Award,
  AlertTriangle,
  ClipboardList
} from "lucide-react";
import { Restaurant, MenuItem, FoodOrder, TableBooking, Review } from "./types";
import { initialRestaurants, initialMenuItems, initialReviews } from "./data";
import { useBookings } from "./hooks/useBookings";
import { useOrders } from "./hooks/useOrders";

export default function OwnerApp() {
  // --- Load Google Fonts dynamically for Indian Royal Style ---
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700&family=Outfit:wght@350;450;600;800;900&family=Playfair+Display:ital,wght@0,600;0,800;1,500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // --- Owner Dashboard Intro Splash Screen ---
  const [showSplash, setShowSplash] = useState(true);
  const [loadingStep, setLoadingStep] = useState("Connecting to royal kitchen...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress loader simulation
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 1.25;
      });
    }, 30);

    // Text step updates
    const t1 = setTimeout(() => setLoadingStep("Synchronizing banquet tables..."), 1000);
    const t2 = setTimeout(() => setLoadingStep("Initializing AI Maharaja Advisor..."), 2000);
    const t3 = setTimeout(() => setShowSplash(false), 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  // --- Persistent Local Database State ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("rsl_restaurants");
    return saved ? JSON.parse(saved) : initialRestaurants;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("rsl_menu_items");
    return saved ? JSON.parse(saved) : initialMenuItems;
  });

  const { bookings, setBookings, handleConfirmBooking: baseConfirmBooking, handleUpdateBookingStatus } = useBookings();
  const { orders, setOrders, handleUpdateOrderStatus } = useOrders();

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("rsl_reviews");
    return saved ? JSON.parse(saved) : initialReviews;
  });

  // State for active views in the dashboard
  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState("");
  const [activeTab, setActiveTab] = useState<"orders" | "bookings" | "reviews">("orders");

  // Dashboard Tabs: command | seating | reports | ai_advisor
  const [activeDashboardTab, setActiveDashboardTab] = useState<"command" | "seating" | "reports" | "ai_advisor">("command");

  // Inline replies states
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [tempReplyText, setTempReplyText] = useState("");

  // Assign Table inline state
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState("Table 1");
  const [vacantTableModalId, setVacantTableModalId] = useState<string | null>(null);

  // Hover state for interactive Sales SVG Chart
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number, y: number, hour: string, amount: number, ordersCount: number } | null>(null);

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem("rsl_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  // Save updates to local storage
  useEffect(() => {
    localStorage.setItem("rsl_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("rsl_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Synchronize state changes in real-time
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === "rsl_menu_items" && e.newValue) {
          setMenuItems(JSON.parse(e.newValue));
        }
        if (e.key === "rsl_restaurants" && e.newValue) {
          setRestaurants(JSON.parse(e.newValue));
        }
        if (e.key === "rsl_reviews" && e.newValue) {
          setReviews(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.warn("Storage sync failed in OwnerApp:", err);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // --- Handlers ---
  const handleToggleSpecialOption = (itemId: number, isSpecial: boolean) => {
    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, isSpecial } : m)
    );
  };

  const handleToggleAvailability = (itemId: number, isAvailable: boolean) => {
    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, isAvailable } : m)
    );
  };

  const handleUpdatePriceOption = (itemId: number, newPrice: number) => {
    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, price: newPrice } : m)
    );
  };

  const handlePriceSave = (itemId: number) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed > 0) {
      handleUpdatePriceOption(itemId, parsed);
      setEditingPriceId(null);
      setTempPrice("");
    }
  };

  const handleConfirmBooking = (bookingId: number, tableNumber: string) => {
    baseConfirmBooking(bookingId, tableNumber);
    setAssigningBookingId(null);
    setVacantTableModalId(null);
  };

  const handleSendChefReply = (reviewId: number) => {
    if (!tempReplyText.trim()) return;
    setReviews(prev => 
      prev.map(r => r.id === reviewId ? { ...r, chefResponse: tempReplyText.trim() } : r)
    );
    setReplyingReviewId(null);
    setTempReplyText("");
  };

  const navigateToCustomer = () => {
    window.history.pushState(null, "", "/");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  // --- Calculations for Analytics & Charts ---
  const totalRevenue = orders.reduce((acc, curr) => curr.status !== "Cancelled" ? acc + curr.total : acc, 0);
  const totalBookingsCount = bookings.length;
  const activeOrdersCount = orders.filter(o => o.status === "Placed" || o.status === "Preparing" || o.status === "Out for Delivery").length;
  const seatedTablesCount = bookings.filter(b => b.status === "Seated").length;

  const tablesOptions = [
    "Table 1", "Table 2", "Table 3", "Table 4", 
    "Table 5", "Table 6", "Table 7", "Table 8", 
    "Table 9", "Table 10", "Table 11", "Table 12"
  ];

  // Group dish metrics
  const topDishesMap: { [dishName: string]: { qty: number; totalRev: number; isVeg: boolean } } = {};
  orders.forEach(order => {
    if (order.status !== "Cancelled" && order.items) {
      order.items.forEach(item => {
        const name = item.menuItem.name;
        const qty = item.quantity;
        const rev = item.menuItem.price * qty;
        if (topDishesMap[name]) {
          topDishesMap[name].qty += qty;
          topDishesMap[name].totalRev += rev;
        } else {
          topDishesMap[name] = { qty, totalRev: rev, isVeg: item.menuItem.isVeg };
        }
      });
    }
  });

  const sortedTopDishes = Object.entries(topDishesMap)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 5);

  const activeRest = restaurants.find(r => r.id === selectedRestId);

  // Menu filter
  const activeRestItems = menuItems.filter(item => {
    const matchesRest = item.restaurantId === selectedRestId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRest && matchesSearch;
  });

  const restOrders = orders.filter(o => o.restaurantId === selectedRestId);
  const restBookings = bookings.filter(b => b.restaurantId === selectedRestId);
  const restReviews = reviews.filter(r => r.restaurantId === selectedRestId);

  // Category counts
  const categorySales = { Biryani: 4, Mains: 8, Starters: 12, Breads: 15, Desserts: 5 };
  orders.forEach(order => {
    if (order.status !== "Cancelled" && order.items) {
      order.items.forEach(item => {
        const cat = item.menuItem.category;
        if (cat.includes("Biryani")) categorySales.Biryani += item.quantity;
        else if (cat.includes("Starter")) categorySales.Starters += item.quantity;
        else if (cat.includes("Bread")) categorySales.Breads += item.quantity;
        else if (cat.includes("Dessert")) categorySales.Desserts += item.quantity;
        else categorySales.Mains += item.quantity;
      });
    }
  });

  // Real-time AI Advisor calculations
  const activeRestItemsList = menuItems.filter(item => item.restaurantId === selectedRestId);
  const outOfStockItems = activeRestItemsList.filter(item => item.isAvailable === false);
  const specialItems = activeRestItemsList.filter(item => item.isSpecial);
  const outOfStockSpecials = activeRestItemsList.filter(item => item.isSpecial && item.isAvailable === false);
  const potentialSpecials = activeRestItemsList.filter(item => !item.isSpecial && item.isAvailable !== false);
  const highestPricedItem = [...activeRestItemsList].sort((a, b) => b.price - a.price)[0];

  // Dynamic top ordered item
  const orderCounts: Record<number, number> = {};
  orders.forEach(o => {
    if (o.restaurantId === selectedRestId && o.status !== "Cancelled") {
      o.items?.forEach(it => {
        orderCounts[it.menuItem.id] = (orderCounts[it.menuItem.id] || 0) + it.quantity;
      });
    }
  });
  const topOrderedItemId = Object.entries(orderCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topOrderedItem = topOrderedItemId ? activeRestItemsList.find(i => i.id === parseInt(topOrderedItemId)) : null;

  // Unanswered reviews
  const unansweredReviews = reviews.filter(r => r.restaurantId === selectedRestId && !r.chefResponse);
  const latestReview = reviews.filter(r => r.restaurantId === selectedRestId).sort((a, b) => b.id - a.id)[0];

  return (
    <div 
      className="min-h-screen bg-[#FAF7F2] text-[#2C2321] flex flex-col font-sans relative overflow-x-hidden selection:bg-[#C84B31] selection:text-white"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <AnimatePresence>
        {showSplash && (
          <motion.div 
            key="owner-splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }}
            transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-50 bg-[#150D0C] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Subtle Royal Radial Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(200,157,94,0.06)_0%,transparent_70%)] pointer-events-none" />

            {/* Rotating Seal / Mandala */}
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 0.95, 
                rotate: 0,
                transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] }
              }}
              className="w-36 h-36 mb-8 text-[#C89D5E] relative flex items-center justify-center"
            >
              {/* Spinning outer mandala rings */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 24, ease: "linear" }}
                className="absolute inset-0"
              >
                <svg className="w-full h-full opacity-65" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                  <circle cx="50" cy="50" r="46" strokeWidth="0.5" strokeDasharray="3,3" />
                  <circle cx="50" cy="50" r="40" strokeWidth="0.75" />
                  <circle cx="50" cy="50" r="32" strokeWidth="0.5" strokeDasharray="1,1" />
                  {Array.from({ length: 16 }).map((_, i) => {
                    const angle = (i * 360) / 16;
                    return (
                      <line
                        key={`line-${i}`}
                        x1="50"
                        y1="10"
                        x2="50"
                        y2="18"
                        transform={`rotate(${angle} 50 50)`}
                        strokeWidth="0.75"
                      />
                    );
                  })}
                </svg>
              </motion.div>

              {/* Counter-spinning inner ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                className="absolute w-24 h-24"
              >
                <svg className="w-full h-full opacity-80" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                  <circle cx="50" cy="50" r="38" strokeWidth="0.5" strokeDasharray="2,2" />
                  <circle cx="50" cy="50" r="28" strokeWidth="0.9" />
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i * 360) / 8;
                    return (
                      <circle
                        key={`inner-dot-${i}`}
                        cx="50"
                        cy="22"
                        r="1.2"
                        transform={`rotate(${angle} 50 50)`}
                        fill="currentColor"
                      />
                    );
                  })}
                </svg>
              </motion.div>

              {/* Static Royal Crown/Lotus SVG in Center */}
              <svg className="w-10 h-10 text-[#C89D5E] drop-shadow-[0_0_8px_rgba(200,157,94,0.4)]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 1 2.5 6.5A10 10 0 0 1 12 15a10 10 0 0 1-2.5-6.5A10 10 0 0 1 12 2zm0 13a7 7 0 0 1 2 4.5A7 7 0 0 1 12 24a7 7 0 0 1-2-4.5A7 7 0 0 1 12 15zm-5-6a7 7 0 0 1 4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1-4.5 2A7 7 0 0 1 7 9.5zm10 0a7 7 0 0 1-4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1 4.5 2A7 7 0 0 1 17 9.5z" />
              </svg>
            </motion.div>

            {/* Brand Title Reveal */}
            <div className="flex flex-col items-center gap-3 text-center z-10 w-[300px] select-none">
              <motion.h1 
                className="text-4xl font-extrabold tracking-[0.18em] uppercase text-[#FAF7F2] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', serif" }}
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.06,
                      delayChildren: 0.4
                    }
                  }
                }}
              >
                {["R", "O", "Y", "A", "L", " ", "I", "N", "D", "I", "A"].map((char, index) => (
                  <motion.span
                    key={index}
                    variants={{
                      hidden: { opacity: 0, y: 15, scale: 0.8 },
                      visible: { 
                        opacity: 1, 
                        y: 0, 
                        scale: 1,
                        transition: { type: "spring", stiffness: 200, damping: 15 }
                      }
                    }}
                    className="inline-block"
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Subtitle brand */}
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ 
                  opacity: 1, 
                  scaleX: 1,
                  transition: { delay: 1.2, duration: 0.8, ease: "easeOut" }
                }}
                className="flex items-center gap-3 w-full origin-center"
              >
                <div className="h-[0.5px] flex-1 bg-gradient-to-r from-transparent to-[#C89D5E]/60" />
                <span className="text-[10px] uppercase font-extrabold tracking-[0.25em] text-[#C89D5E] font-mono">
                  Darbar Control Desk
                </span>
                <div className="h-[0.5px] flex-1 bg-gradient-to-l from-transparent to-[#C89D5E]/60" />
              </motion.div>

              {/* Tagline */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 0.6,
                  transition: { delay: 1.5, duration: 1.0 }
                }}
                className="text-[10px] text-slate-400 font-medium tracking-wider mt-1"
              >
                Real-time backoffice & AI intelligence
              </motion.p>
            </div>

            {/* Custom Progress Bar Loader at the bottom */}
            <div className="absolute bottom-20 flex flex-col items-center gap-3 w-[260px]">
              <div className="w-full h-1 bg-[#FAF7F2]/10 rounded-full overflow-hidden relative border border-white/5">
                <motion.div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#C84B31] via-[#C89D5E] to-yellow-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              {/* Dynamic steps label */}
              <motion.span
                key={loadingStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 0.7, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.3 }}
                className="text-[9px] font-bold font-mono tracking-widest text-[#FAF7F2] opacity-70 uppercase text-center"
              >
                {loadingStep}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header: Modern Glassmorphic Heritage Aesthetic */}
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E8DCC4]/50 px-6 py-4.5 flex flex-col md:flex-row justify-between items-center gap-4 shadow-[0_2px_15px_rgba(44,35,33,0.02)] select-none shrink-0 relative z-30">
        <div className="flex items-center gap-3.5 select-none py-1">
          <div className="flex flex-col items-center justify-center text-center select-none">
            <motion.h1 
              initial={{ 
                opacity: 0, 
                y: 15, 
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
              className="text-3xl font-extrabold uppercase leading-none animate-gold-shine text-center flex flex-col items-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              <span>Royal India</span>
              <span className="mt-1">Spoon</span>
            </motion.h1>
            <motion.div 
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 0.8, scaleX: 1 }}
              transition={{ 
                delay: 0.4, 
                duration: 1.0, 
                ease: [0.16, 1, 0.3, 1] 
              }}
              className="flex items-center gap-2.5 w-full max-w-[185px] mt-2 origin-center"
            >
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#C89D5E]" />
              <svg className="w-4 h-4 text-[#C89D5E] animate-pulse" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 1 2.5 6.5A10 10 0 0 1 12 15a10 10 0 0 1-2.5-6.5A10 10 0 0 1 12 2zm0 13a7 7 0 0 1 2 4.5A7 7 0 0 1 12 24a7 7 0 0 1-2-4.5A7 7 0 0 1 12 15zm-5-6a7 7 0 0 1 4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1-4.5 2A7 7 0 0 1 7 9.5zm10 0a7 7 0 0 1-4.5-2A7 7 0 0 1 12 11.5a7 7 0 0 1 4.5 2A7 7 0 0 1 17 9.5z" opacity="0.85" />
              </svg>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#C89D5E]" />
            </motion.div>
          </div>
        </div>

        {/* Dashboard Tabs: Modern Sleek Pill Selector */}
        <div className="flex bg-[#FAF7F2]/90 p-1.5 rounded-2xl border border-[#E8DCC4]/60 gap-1 shadow-inner">
          <button
            onClick={() => setActiveDashboardTab("command")}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "command"
                ? "bg-white text-[#C84B31] shadow-sm border border-[#E8DCC4]/30"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Utensils size={14} />
            <span>Darbar Command</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("seating")}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "seating"
                ? "bg-white text-[#C84B31] shadow-sm border border-[#E8DCC4]/30"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <CalendarCheck size={14} />
            <span>Seating Board</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("reports")}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "reports"
                ? "bg-white text-[#C84B31] shadow-sm border border-[#E8DCC4]/30"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <TrendingUp size={14} />
            <span>Imperial Reports</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("ai_advisor")}
            className={`flex items-center gap-2 px-4.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "ai_advisor"
                ? "bg-white text-[#C84B31] shadow-sm border border-[#E8DCC4]/30"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sparkles size={14} className="text-[#C89D5E]" />
            <span>AI Advisor</span>
          </button>
        </div>

        <button 
          onClick={navigateToCustomer}
          className="flex items-center gap-2 bg-white hover:bg-[#FAF7F2] text-[#C84B31] hover:text-[#B33E26] font-bold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-sm cursor-pointer border border-[#E8DCC4]"
        >
          <LogOut size={14} className="rotate-180" />
          <span>Go to Customer App</span>
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl w-full mx-auto relative z-20">
        
        {/* Metric Cards: Warm Ivory, Slate Text, Gold Linings */}
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: {
                staggerChildren: 0.08
              }
            }
          }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none shrink-0"
        >
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4, borderColor: "#C89D5E/50", boxShadow: "0 8px 30px rgba(44,35,33,0.05)" }}
            className="bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-1.5 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Darbar Revenue</span>
              <TrendingUp size={16} className="text-emerald-600 animate-bounce" style={{ animationDuration: "3s" }} />
            </div>
            <span className="text-2xl font-mono font-black text-[#1E1412] leading-none">
              ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              Live updates active
            </span>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4, borderColor: "#C89D5E/50", boxShadow: "0 8px 30px rgba(44,35,33,0.05)" }}
            className="bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-1.5 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Tandoors Active</span>
              <ShoppingBag size={16} className="text-[#C84B31]" />
            </div>
            <span className="text-2xl font-mono font-black text-[#1E1412] leading-none">
              {activeOrdersCount}
            </span>
            <span className="text-[10px] text-[#C84B31] font-bold uppercase tracking-wider">
              Pending Prep
            </span>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4, borderColor: "#C89D5E/50", boxShadow: "0 8px 30px rgba(44,35,33,0.05)" }}
            className="bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-1.5 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Seating Capacity</span>
              <CalendarDays size={16} className="text-blue-600" />
            </div>
            <span className="text-2xl font-mono font-black text-[#1E1412] leading-none">
              {seatedTablesCount} <span className="text-xs text-slate-500 font-normal">/ 12 Seated</span>
            </span>
            <div className="w-full bg-[#FAF7F2] rounded-full h-1.5 mt-1 border border-slate-200 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(seatedTablesCount / 12) * 100}%` }}
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 rounded-full" 
                transition={{ duration: 1.0, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 15, scale: 0.96 },
              visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 15 } }
            }}
            whileHover={{ y: -4, borderColor: "#C89D5E/50", boxShadow: "0 8px 30px rgba(44,35,33,0.05)" }}
            className="bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-1.5 relative overflow-hidden group transition-colors duration-300"
          >
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-500">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Gourmet Spots</span>
              <Layers size={16} className="text-[#C89D5E]" />
            </div>
            <span className="text-2xl font-mono font-black text-[#1E1412] leading-none">
              {restaurants.length} spots
            </span>
            <span className="text-[10px] text-[#C89D5E] font-semibold font-mono">
              Synchronized
            </span>
          </motion.div>
        </motion.section>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeDashboardTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 flex flex-col gap-6"
          >
            {/* TAB 1: DARBAR COMMAND CONSOLE */}
            {activeDashboardTab === "command" && (
              <>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              {/* Left Column: Menu Inventory */}
              <section className="lg:col-span-6 bg-white rounded-3xl border border-[#E8DCC4] p-5 flex flex-col gap-4 min-h-[450px] shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
                <div className="flex flex-col gap-1 select-none">
                  <h3 className="text-sm font-bold text-[#1E1412] uppercase font-mono tracking-wider flex items-center gap-2">
                    <Utensils size={14} className="text-[#C84B31]" />
                    Culinary Menu & Stock
                  </h3>
                  <p className="text-xs text-slate-500">
                    Update prices, toggles, and mark dishes as available in real-time.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search delicacies (e.g. Paneer, Tikka)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#E8DCC4]/60 rounded-xl py-2.5 pl-9 pr-4 text-xs text-[#2C2321] focus:outline-none focus:border-[#C89D5E] transition-all font-medium placeholder-slate-450"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedRestId}
                      onChange={(e) => setSelectedRestId(parseInt(e.target.value))}
                      className="bg-[#FAF7F2] border border-[#E8DCC4]/60 rounded-xl py-2.5 px-3.5 pr-8 text-xs text-[#C84B31] font-bold focus:outline-none focus:border-[#C89D5E] appearance-none cursor-pointer"
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-3.5 rotate-90 text-[#C84B31] pointer-events-none" />
                  </div>
                </div>

                {/* Dishes List */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[380px] [scrollbar-width:thin]">
                  {activeRestItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <Search size={28} className="text-slate-300 mb-2" />
                      <span className="text-xs text-slate-500 font-bold">No delicacies found</span>
                    </div>
                  ) : (
                    activeRestItems.map(item => (
                      <div 
                        key={item.id}
                        className={`p-3.5 rounded-2xl border transition-all flex justify-between items-center gap-3 ${
                          item.isAvailable === false
                            ? "bg-[#F5EFEB] border-[#E8DCC4]/40 opacity-60"
                            : "bg-[#FAF7F2]/40 border-[#E8DCC4]/40 hover:border-[#C89D5E]/60 hover:bg-white"
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${item.isVeg ? "bg-emerald-600" : "bg-red-650"}`} />
                            <span className="text-xs font-bold text-[#2C2321] truncate">{item.name}</span>
                            {item.isAvailable === false && (
                              <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] px-1.5 py-0.5 rounded-md font-bold font-mono">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 capitalize font-mono">{item.category}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-xs">{item.description}</span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {/* Price */}
                          <div className="flex items-center gap-1.5">
                            {editingPriceId === item.id ? (
                              <div className="flex items-center gap-1 bg-white border border-[#C89D5E]/40 rounded-lg p-0.5">
                                <span className="text-xs text-slate-400 font-mono pl-1">₹</span>
                                <input 
                                  type="text" 
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-12 bg-transparent text-xs text-[#2C2321] focus:outline-none font-mono font-bold"
                                  autoFocus
                                />
                                <button 
                                  onClick={() => handlePriceSave(item.id)}
                                  className="bg-emerald-600 text-white rounded-md p-1 hover:bg-emerald-500 cursor-pointer"
                                >
                                  <Check size={10} />
                                </button>
                              </div>
                            ) : (
                              <button 
                                onClick={() => {
                                  setEditingPriceId(item.id);
                                  setTempPrice(String(item.price));
                                }}
                                className="text-xs font-mono font-black text-[#C84B31] hover:underline cursor-pointer"
                                title="Click to edit price"
                              >
                                ₹{item.price}
                              </button>
                            )}
                          </div>

                          {/* Specials */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Special</span>
                            <button
                              onClick={() => handleToggleSpecialOption(item.id, !item.isSpecial)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer border ${
                                item.isSpecial 
                                  ? "bg-[#C84B31] border-[#C84B31]" 
                                  : "bg-slate-200 border-slate-300"
                              }`}
                            >
                              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-all ${item.isSpecial ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Stock Availability */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Stock</span>
                            <button
                              onClick={() => handleToggleAvailability(item.id, item.isAvailable !== false ? false : true)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all cursor-pointer border ${
                                item.isAvailable !== false 
                                  ? "bg-emerald-600 border-emerald-600" 
                                  : "bg-slate-200 border-slate-300"
                              }`}
                            >
                              <div className={`bg-white w-3.5 h-3.5 rounded-full shadow-sm transition-all ${item.isAvailable !== false ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Right Column: Interactive feeds */}
              <section className="lg:col-span-6 bg-white rounded-3xl border border-[#E8DCC4] p-5 flex flex-col gap-4 shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
                <div className="flex justify-between items-center select-none">
                  <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DCC4]/50">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "orders" ? "bg-[#C84B31] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Orders ({restOrders.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "bookings" ? "bg-[#C84B31] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Bookings ({restBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "reviews" ? "bg-[#C84B31] text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Reviews ({restReviews.length})
                    </button>
                  </div>
                  <span className="flex items-center gap-1.5 text-[9px] bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200 font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[380px] [scrollbar-width:thin]">
                  {/* Orders List */}
                  {activeTab === "orders" && (
                    restOrders.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <ShoppingBag size={28} className="text-slate-300 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No active orders placed</span>
                      </div>
                    ) : (
                      restOrders.map(order => (
                        <div key={order.id} className="bg-[#FAF7F2]/40 border border-[#E8DCC4]/40 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[#2C2321]">Order #{order.id}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-mono font-black text-[#C84B31]">₹{order.total}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                order.status === "Delivered"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : order.status === "Cancelled"
                                  ? "bg-red-50 text-red-650 border border-red-200"
                                  : "bg-amber-50 text-[#C89D5E] border border-amber-200"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-700 bg-white p-2.5 rounded-xl font-medium border border-[#E8DCC4]/30">
                            {order.itemsSummary}
                          </div>

                          {order.status !== "Delivered" && order.status !== "Cancelled" && (
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
                              {order.status === "Placed" && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                  className="flex-1 bg-[#C84B31] hover:bg-[#B33E26] text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                                >
                                  Accept & Prepare
                                </button>
                              )}
                              {order.status === "Preparing" && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, "Out for Delivery")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                                >
                                  Ship / Out for Delivery
                                </button>
                              )}
                              {order.status === "Out for Delivery" && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              <button 
                                onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                className="bg-red-50 hover:bg-red-100 text-red-650 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-red-200"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )
                  )}

                  {/* Bookings List */}
                  {activeTab === "bookings" && (
                    restBookings.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <CalendarCheck size={28} className="text-slate-300 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No current table bookings</span>
                      </div>
                    ) : (
                      restBookings.map(booking => (
                        <div key={booking.id} className="bg-[#FAF7F2]/40 border border-[#E8DCC4]/40 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[#2C2321]">{booking.guestName}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {booking.guestPhone} • {booking.numGuests} guests
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              booking.status === "Confirmed" || booking.status === "Seated"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : booking.status === "Cancelled" || booking.status === "Declined"
                                ? "bg-red-50 text-red-650 border border-red-200"
                                : "bg-amber-50 text-[#C89D5E] border border-amber-200"
                            }`}>
                              {booking.status} {booking.tableNumber ? `(${booking.tableNumber})` : ""}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-white p-2.5 rounded-xl border border-[#E8DCC4]/30 font-semibold text-slate-650">
                            <div>Date: <span className="text-[#2C2321] font-bold">{booking.date}</span></div>
                            <div>Time: <span className="text-[#2C2321] font-bold">{booking.time}</span></div>
                            <div>Seating: <span className="text-[#2C2321] font-bold capitalize">{booking.seatingArea}</span></div>
                            {booking.specialRequest && (
                              <div className="col-span-2 mt-1 pt-1 border-t border-slate-100 truncate text-slate-500">
                                Request: "{booking.specialRequest}"
                              </div>
                            )}
                          </div>

                          {booking.status === "Pending" && (
                            <div className="flex gap-2 pt-1 border-t border-slate-100">
                              {assigningBookingId === booking.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                  <select
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="bg-white border border-[#E8DCC4] rounded-lg py-1.5 px-2.5 text-xs text-[#2C2321] focus:outline-none"
                                  >
                                    {tablesOptions.map(t => (
                                      <option key={t} value={t}>{t}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleConfirmBooking(booking.id, selectedTable)}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer"
                                  >
                                    Confirm
                                  </button>
                                  <button
                                    onClick={() => setAssigningBookingId(null)}
                                    className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <button 
                                    onClick={() => {
                                      setAssigningBookingId(booking.id);
                                      setSelectedTable("Table 1");
                                    }}
                                    className="flex-1 bg-[#C84B31] hover:bg-[#B33E26] text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                                  >
                                    Approve & Assign Table
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateBookingStatus(booking.id, "Declined")}
                                    className="bg-red-50 hover:bg-red-100 text-red-655 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-red-200"
                                  >
                                    Decline
                                  </button>
                                </>
                              )}
                            </div>
                          )}

                          {booking.status === "Confirmed" && (
                            <button
                              onClick={() => handleUpdateBookingStatus(booking.id, "Seated")}
                              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                            >
                              Seat Guests Now
                            </button>
                          )}
                        </div>
                      ))
                    )
                  )}

                  {/* Reviews List */}
                  {activeTab === "reviews" && (
                    restReviews.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare size={28} className="text-slate-300 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No customer reviews written</span>
                      </div>
                    ) : (
                      restReviews.map(review => (
                        <div key={review.id} className="bg-[#FAF7F2]/40 border border-[#E8DCC4]/40 rounded-2xl p-4 flex flex-col gap-2.5">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-[#2C2321]">{review.userName}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {new Date(review.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-xs font-black text-[#C84B31]">★ {review.rating} / 5</span>
                          </div>

                          <p className="text-xs text-slate-700 italic font-medium leading-relaxed">
                            "{review.comment}"
                          </p>

                          {review.chefResponse ? (
                            <div className="bg-red-50/50 border border-red-100 rounded-xl p-3 flex flex-col gap-1 mt-1">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-[#C84B31]">Chef Response Sent:</span>
                              <p className="text-xs text-[#C84B31] font-medium italic">
                                "{review.chefResponse}"
                              </p>
                            </div>
                          ) : replyingReviewId === review.id ? (
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
                              <textarea
                                value={tempReplyText}
                                onChange={(e) => setTempReplyText(e.target.value)}
                                placeholder="Write a royal hospitality note..."
                                rows={2}
                                className="w-full bg-white border border-[#E8DCC4] rounded-xl p-2.5 text-xs text-[#2C2321] focus:outline-none focus:border-[#C84B31] placeholder-slate-400 resize-none font-medium"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleSendChefReply(review.id)}
                                  className="bg-[#C84B31] hover:bg-[#B33E26] text-white font-bold text-[10px] py-1.5 px-4 rounded-lg cursor-pointer animate-pulse"
                                >
                                  Submit Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingReviewId(null);
                                    setTempReplyText("");
                                  }}
                                  className="text-slate-400 hover:text-slate-600 text-xs font-semibold px-2 cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingReviewId(review.id);
                                setTempReplyText("");
                              }}
                              className="flex items-center gap-1.5 text-slate-500 hover:text-[#C84B31] text-[10px] font-bold mt-1 self-start cursor-pointer transition-all"
                            >
                              <MessageCircleReply size={13} />
                              Reply as Chef
                            </button>
                          )}
                        </div>
                      ))
                    )
                  )}
                </div>
              </section>
            </div>

            {/* Bottom Section: Top dishes + Seating assignments */}
            <section className="bg-white rounded-3xl border border-[#E8DCC4] p-5 grid grid-cols-1 md:grid-cols-2 gap-6 select-none shrink-0 shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
              {/* Top Gourmet Dishes */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-[#C84B31]" />
                  <h3 className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">
                    Top Ordered Gourmet Dishes
                  </h3>
                </div>
                <div className="bg-[#FAF7F2]/40 rounded-2xl border border-[#E8DCC4]/30 p-4 divide-y divide-slate-150">
                  {sortedTopDishes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-400 font-medium">
                      Waiting for sales data to aggregate...
                    </div>
                  ) : (
                    sortedTopDishes.map(([dishName, stats], i) => (
                      <div key={dishName} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-[#C84B31]">#{i + 1}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-[#2C2321] flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${stats.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {dishName}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                              ₹{stats.totalRev.toLocaleString("en-IN")} total sales
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-black text-[#2C2321] bg-white px-2.5 py-0.5 rounded border border-[#E8DCC4]/30">
                          {stats.qty} sold
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Table assignments status */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-blue-600" />
                  <h3 className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">
                    Live Banquet Table Assignments
                  </h3>
                </div>
                <div className="bg-[#FAF7F2]/40 rounded-2xl border border-[#E8DCC4]/30 p-4 flex flex-col gap-2">
                  <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Active Assignments:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {tablesOptions.map(table => {
                      const isAssigned = bookings.some(b => b.tableNumber === table && (b.status === "Confirmed" || b.status === "Seated"));
                      const isSeated = bookings.some(b => b.tableNumber === table && b.status === "Seated");
                      return (
                        <div 
                          key={table}
                          className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1 text-[10px] font-bold font-mono transition-all ${
                            isSeated 
                              ? "bg-purple-50 border-purple-200 text-purple-700 ring-1 ring-purple-500/10"
                              : isAssigned
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-white border-slate-200 text-slate-450"
                          }`}
                        >
                          <span className="text-[8px] font-sans font-black">
                            {isSeated ? "SEATED" : isAssigned ? "RESERVED" : "VACANT"}
                          </span>
                          <span className="leading-none">{table.split(" ")[1]}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        {/* TAB 2: VISUAL SEATING PLANNER */}
        {activeDashboardTab === "seating" && (
          <section className="flex-1 bg-white rounded-3xl border border-[#E8DCC4] p-6 flex flex-col gap-6 shadow-[0_6px_25px_rgba(44,35,33,0.03)] relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-[#1E1412] uppercase font-mono tracking-wider flex items-center gap-2">
                  <CalendarCheck size={18} className="text-[#C84B31]" />
                  Royal Pavilion Seating Planner
                </h3>
                <p className="text-xs text-slate-500">
                  Manage active tables layout. Click on vacant tables to assign pending reservations, or seat and release occupied tables.
                </p>
              </div>

              {/* Legend indicators */}
              <div className="flex gap-4 text-[10px] font-bold font-mono bg-[#FAF7F2] px-3.5 py-1.5 rounded-xl border border-[#E8DCC4]/60 shrink-0">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Vacant
                </span>
                <span className="flex items-center gap-1.5 text-blue-750">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Reserved
                </span>
                <span className="flex items-center gap-1.5 text-purple-700">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Seated
                </span>
              </div>
            </div>

            {/* Tables Grid layout */}
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.04
                  }
                }
              }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
            >
              {tablesOptions.map(table => {
                const activeBooking = bookings.find(b => b.tableNumber === table && (b.status === "Confirmed" || b.status === "Seated"));
                const status = activeBooking ? activeBooking.status : "Vacant";

                return (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, scale: 0.95, y: 12 },
                      visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 15 } }
                    }}
                    whileHover={{ scale: 1.015, boxShadow: "0 8px 25px rgba(44,35,33,0.04)" }}
                    key={table}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between min-h-[160px] transition-all relative overflow-hidden group ${
                      status === "Seated"
                        ? "bg-purple-50/50 border-purple-200 text-[#2C2321] shadow-[0_4px_15px_rgba(147,51,234,0.04)]"
                        : status === "Confirmed"
                        ? "bg-blue-50/50 border-blue-200 text-[#2C2321] shadow-[0_4px_15px_rgba(59,130,246,0.04)]"
                        : "bg-[#FAF7F2]/40 border-[#E8DCC4]/50 hover:border-[#C89D5E]/80 text-[#6E5D5A] hover:bg-white hover:shadow-md transition-all"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 select-none">
                      <span className="text-lg font-black tracking-tight text-[#2C2321]">{table}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        status === "Seated"
                          ? "bg-purple-100 text-purple-700"
                          : status === "Confirmed"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}>
                        {status === "Seated" ? "SEATED" : status === "Confirmed" ? "RESERVED" : "VACANT"}
                      </span>
                    </div>

                    {activeBooking ? (
                      <div className="flex flex-col gap-1 mt-1 text-[11px] text-slate-700">
                        <span className="font-bold text-[#2C2321] flex items-center gap-1.5">
                          <User size={11} className="text-slate-400" />
                          {activeBooking.guestName}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          📱 {activeBooking.guestPhone}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1.5 font-semibold mt-1">
                          👥 {activeBooking.numGuests} guests • {activeBooking.time}
                        </span>
                        {activeBooking.specialRequest && (
                          <span className="text-[9.5px] italic text-[#C84B31]/80 truncate mt-1">
                            " {activeBooking.specialRequest} "
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center select-none text-[10px] text-slate-450">
                        <Utensils size={18} className="text-slate-355 mb-1" />
                        <span>Ready for guests</span>
                      </div>
                    )}

                    <div className="mt-3.5 pt-2 border-t border-slate-100 flex gap-2">
                      {status === "Vacant" ? (
                        <button
                          onClick={() => setVacantTableModalId(table)}
                          className="w-full bg-white hover:bg-[#C84B31] text-[#2C2321] hover:text-white font-bold text-[10px] py-1.5 rounded-lg border border-[#E8DCC4] cursor-pointer text-center transition-all"
                        >
                          + Assign Seating
                        </button>
                      ) : status === "Confirmed" ? (
                        <>
                          <button
                            onClick={() => handleUpdateBookingStatus(activeBooking.id, "Seated")}
                            className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] py-1.5 rounded-lg cursor-pointer text-center"
                          >
                            Seat Guests
                          </button>
                          <button
                            onClick={() => handleUpdateBookingStatus(activeBooking.id, "Completed")}
                            className="bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-bold text-[10px] p-1.5 rounded-lg cursor-pointer text-center border border-slate-200"
                            title="Release Reservation"
                          >
                            Release
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateBookingStatus(activeBooking.id, "Completed")}
                          className="w-full bg-emerald-600/10 hover:bg-[#C84B31] border border-emerald-200 text-emerald-800 hover:text-white font-bold text-[10px] py-1.5 rounded-lg cursor-pointer text-center transition-all"
                        >
                          Mark Completed / Vacate
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Quick Assign Modal */}
            {vacantTableModalId && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-40 rounded-3xl select-none animate-fade-in">
                <div className="bg-white border border-[#E8DCC4] rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <h4 className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">
                      Assign Booking to {vacantTableModalId}
                    </h4>
                    <button
                      onClick={() => setVacantTableModalId(null)}
                      className="text-slate-400 hover:text-slate-650 text-xs font-bold font-mono cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-500 leading-normal">
                    Select a reservation to assign to {vacantTableModalId}. Confirmed reservations will automatically seat in real-time.
                  </p>

                  <div className="flex-1 overflow-y-auto max-h-[200px] flex flex-col gap-2 [scrollbar-width:thin]">
                    {bookings.filter(b => b.status === "Pending").length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 font-bold">
                        No pending bookings needing assignment
                      </div>
                    ) : (
                      bookings.filter(b => b.status === "Pending").map(b => (
                        <div 
                          key={b.id}
                          onClick={() => handleConfirmBooking(b.id, vacantTableModalId)}
                          className="bg-[#FAF7F2] border border-[#E8DCC4]/50 hover:border-[#C84B31]/60 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all hover:bg-white"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-[#2C2321]">{b.guestName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">👥 {b.numGuests} guests • {b.time}</span>
                          </div>
                          <ChevronRight size={14} className="text-[#C84B31]" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: IMPERIAL REPORTS */}
        {activeDashboardTab === "reports" && (
          <div className="flex-1 flex flex-col gap-6">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              {/* Sales trend */}
              <section className="lg:col-span-7 bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-4">
                <div className="flex justify-between items-center select-none">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">
                      Daily Sales Distribution
                    </h3>
                    <p className="text-[10px] text-slate-550">Hourly revenue trends of peak dinner rush</p>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-[#C84B31]">₹7.2K PEAK</span>
                </div>

                <div className="h-60 bg-[#FAF7F2]/40 rounded-2xl border border-[#E8DCC4]/30 p-4 flex flex-col justify-between relative overflow-hidden">
                  <svg className="w-full h-44 mt-4 overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="terracottaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#C84B31" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#C84B31" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="30" x2="500" y2="30" stroke="#E8DCC4" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#E8DCC4" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#E8DCC4" strokeWidth="1" strokeDasharray="4" />

                    <path
                      d="M 10 140 L 10 115 C 40 105, 70 95, 100 90 C 130 85, 160 120, 190 120 C 220 120, 250 65, 280 50 C 310 35, 340 25, 370 25 C 400 25, 430 35, 460 40 L 460 140 Z"
                      fill="url(#terracottaGradient)"
                    />

                    <path
                      d="M 10 115 C 40 105, 70 95, 100 90 C 130 85, 160 120, 190 120 C 220 120, 250 65, 280 50 C 310 35, 340 25, 370 25 C 400 25, 430 35, 460 40"
                      fill="none"
                      stroke="url(#reportLineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <linearGradient id="reportLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#C84B31" />
                      <stop offset="50%" stopColor="#C89D5E" />
                      <stop offset="100%" stopColor="#13213C" />
                    </linearGradient>

                    {/* Dotted target baseline trend */}
                    <path
                      d="M 10 130 L 100 110 L 190 100 L 280 70 L 370 50 L 460 40"
                      fill="none"
                      stroke="#C89D5E"
                      strokeWidth="1.5"
                      strokeDasharray="3"
                      opacity="0.65"
                    />

                    {/* Interactive segments trigger zones */}
                    <rect x="0" y="0" width="55" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 10, y: 115, hour: "12:00 PM", amount: 1200, ordersCount: 3 })} onMouseLeave={() => setHoveredPoint(null)} />
                    <rect x="55" y="0" width="90" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 100, y: 90, hour: "2:00 PM", amount: 2400, ordersCount: 6 })} onMouseLeave={() => setHoveredPoint(null)} />
                    <rect x="145" y="0" width="90" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 190, y: 120, hour: "4:00 PM", amount: 950, ordersCount: 2 })} onMouseLeave={() => setHoveredPoint(null)} />
                    <rect x="235" y="0" width="90" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 280, y: 50, hour: "6:00 PM", amount: 4800, ordersCount: 11 })} onMouseLeave={() => setHoveredPoint(null)} />
                    <rect x="325" y="0" width="90" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 370, y: 25, hour: "8:00 PM", amount: 7200, ordersCount: 18 })} onMouseLeave={() => setHoveredPoint(null)} />
                    <rect x="415" y="0" width="85" height="150" fill="transparent" className="cursor-pointer" onMouseEnter={() => setHoveredPoint({ x: 460, y: 40, hour: "10:00 PM", amount: 5900, ordersCount: 15 })} onMouseLeave={() => setHoveredPoint(null)} />

                    {/* Data Circles */}
                    <circle cx="10" cy="115" r={hoveredPoint?.hour === "12:00 PM" ? 7 : 4.5} fill="#C84B31" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />
                    <circle cx="100" cy="90" r={hoveredPoint?.hour === "2:00 PM" ? 7 : 4.5} fill="#C89D5E" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />
                    <circle cx="190" cy="120" r={hoveredPoint?.hour === "4:00 PM" ? 7 : 4.5} fill="#C84B31" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />
                    <circle cx="280" cy="50" r={hoveredPoint?.hour === "6:00 PM" ? 7 : 4.5} fill="#C89D5E" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />
                    <circle cx="370" cy="25" r={hoveredPoint?.hour === "8:00 PM" ? 7 : 4.5} fill="#13213C" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />
                    <circle cx="460" cy="40" r={hoveredPoint?.hour === "10:00 PM" ? 7 : 4.5} fill="#C89D5E" stroke="white" strokeWidth="1.5" className="transition-all duration-150" />

                    {/* Hover Tooltip Render */}
                    {hoveredPoint && (() => {
                      const tooltipX = hoveredPoint.x < 65 ? 5 : hoveredPoint.x > 435 ? 385 : hoveredPoint.x - 55;
                      const tooltipY = hoveredPoint.y - 50 < 5 ? 5 : hoveredPoint.y - 50;
                      return (
                        <g className="pointer-events-none animate-scale-up">
                          <line x1={hoveredPoint.x} y1="0" x2={hoveredPoint.x} y2="140" stroke="#C84B31" strokeWidth="1" strokeDasharray="3" opacity="0.6" />
                          <rect x={tooltipX} y={tooltipY} width="110" height="38" rx="8" fill="white" stroke="#E8DCC4" strokeWidth="1" />
                          <text x={tooltipX + 55} y={tooltipY + 14} textAnchor="middle" fill="#2C2321" fontSize="9" fontWeight="bold" fontFamily="Outfit, sans-serif">{hoveredPoint.hour}</text>
                          <text x={tooltipX + 55} y={tooltipY + 28} textAnchor="middle" fill="#C84B31" fontSize="9" fontWeight="bold" fontFamily="JetBrains Mono, monospace">₹{hoveredPoint.amount.toLocaleString("en-IN")}</text>
                        </g>
                      );
                    })()}
                  </svg>

                  <div className="flex justify-between text-[9px] font-bold font-mono text-slate-500 px-1 border-t border-slate-200 pt-2 shrink-0">
                    <span>12:00 PM</span>
                    <span>2:00 PM</span>
                    <span>4:00 PM</span>
                    <span>6:00 PM</span>
                    <span>8:00 PM</span>
                    <span>10:00 PM</span>
                  </div>
                </div>
              </section>

              {/* Category distribution */}
              <section className="lg:col-span-5 bg-white rounded-3xl border border-[#E8DCC4] p-5 shadow-[0_6px_25px_rgba(44,35,33,0.03)] flex flex-col gap-4">
                <div className="flex justify-between items-center select-none">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">
                      Popularity by Category
                    </h3>
                    <p className="text-[10px] text-slate-500">Total dish sales breakdown</p>
                  </div>
                </div>

                <div className="flex-1 bg-[#FAF7F2]/40 rounded-2xl border border-[#E8DCC4]/30 p-4 flex flex-col gap-3.5 justify-center">
                  {Object.entries(categorySales).map(([category, count]) => (
                    <div key={category} className="flex flex-col gap-1 select-none">
                      <div className="flex justify-between text-[10px] font-bold font-mono text-slate-700">
                        <span>{category}</span>
                        <span className="text-[#C84B31]">{count} sold</span>
                      </div>
                      <div className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-slate-200">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / 30) * 100}%` }}
                          transition={{ duration: 1.0, ease: "easeOut" }}
                          className="bg-gradient-to-r from-[#C84B31] to-[#C89D5E] h-2.5 rounded-full"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none">
              <div className="bg-white rounded-3xl border border-[#E8DCC4] p-5 flex flex-col gap-2 shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Average Ticket Value</span>
                <span className="text-xl font-mono font-black text-[#2C2321]">
                  ₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
                </span>
                <p className="text-[10px] text-slate-500">Average spending per order checkout</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8DCC4] p-5 flex flex-col gap-2 shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Busiest Hour</span>
                <span className="text-xl font-bold text-[#C84B31] uppercase tracking-wide">08:00 - 09:00 PM</span>
                <p className="text-[10px] text-slate-500">Peak hour for dining reservations</p>
              </div>

              <div className="bg-white rounded-3xl border border-[#E8DCC4] p-5 flex flex-col gap-2 shadow-[0_6px_25px_rgba(44,35,33,0.03)]">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Turnaround Time</span>
                <span className="text-xl font-mono font-black text-[#2C2321]">55 Mins</span>
                <p className="text-[10px] text-slate-500">Average duration of a table reservation</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI DARBAR ADVISOR */}
        {activeDashboardTab === "ai_advisor" && (
          <section className="flex-1 bg-white rounded-3xl border border-[#E8DCC4] p-6 flex flex-col gap-6 shadow-[0_6px_25px_rgba(44,35,33,0.03)] relative overflow-hidden select-none">
            <div className="absolute right-0 top-0 h-44 w-44 bg-[#C89D5E]/5 blur-3xl rounded-full" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-[#1E1412] uppercase font-mono tracking-wider flex items-center gap-2">
                  <Sparkles size={18} className="text-[#C84B31]" />
                  Royal Darbar AI Advisor
                </h3>
                <p className="text-xs text-slate-500">
                  Daily operation intelligence generated from real-time customer menus, orders, and review comments.
                </p>
              </div>

              <span className="text-[10px] bg-amber-50 text-[#C89D5E] border border-amber-200 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                👑 Maharaja Insights
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Culinary */}
              <div className="bg-[#FAF7F2] border border-[#E8DCC4]/60 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-[#C84B31]" />
                  <span className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">Culinary Recommendations</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-700 leading-relaxed font-medium">
                  {outOfStockSpecials.length > 0 ? (
                    <p>
                      ❌ Chef Special <b className="text-[#C84B31]">{outOfStockSpecials[0].name}</b> is sold out! Toggle it off special or restock ingredients to prevent disappointing royal guests.
                    </p>
                  ) : potentialSpecials.length > 0 ? (
                    <p>
                      👑 We recommend marking <b className="text-[#C84B31]">{potentialSpecials[0].name}</b> as a Chef Special to increase its menu visibility and sales.
                    </p>
                  ) : (
                    <p>
                      👑 All chef specials are fully stocked and active. Keep introducing new seasonal recipes to delight customers.
                    </p>
                  )}
                  {highestPricedItem && (
                    <p>
                      💰 Gourmet menu audits suggest reviewing pricing of <b className="text-[#2C2321]">{highestPricedItem.name}</b> (currently ₹{highestPricedItem.price}) to ensure margins align with category standards.
                    </p>
                  )}
                </div>
              </div>

              {/* Kitchen health */}
              <div className="bg-[#FAF7F2] border border-[#E8DCC4]/60 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-650" />
                  <span className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">Kitchen Health Alerts</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-700 leading-relaxed font-medium">
                  {outOfStockItems.length > 0 ? (
                    <p>
                      ⚠️ Your kitchen is currently running <span className="text-red-650 font-bold">{outOfStockItems.length} {outOfStockItems.length === 1 ? "item" : "items"} out of stock</span> ({outOfStockItems.map(i => i.name).join(', ')}). Customers looking at the menu see a "Sold Out" banner.
                    </p>
                  ) : (
                    <p>
                      ✅ Excellent! All {activeRestItemsList.length} delicacies are fully stocked. Kitchen is running with 0 supply gaps.
                    </p>
                  )}
                  {topOrderedItem ? (
                    <p>
                      🥘 <b className="text-[#2C2321]">{topOrderedItem.name}</b> is ordered frequently (top seller today). Restock fresh ingredients before peak dinner rush.
                    </p>
                  ) : (
                    <p>
                      🥘 Butter Chicken remains a staple. Ensure cream and spices are fully stocked before weekend dinner rush.
                    </p>
                  )}
                </div>
              </div>

              {/* Hospitality */}
              <div className="bg-[#FAF7F2] border border-[#E8DCC4]/60 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-600" />
                  <span className="text-xs font-bold text-[#1E1412] uppercase font-mono tracking-wider">Hospitality Insights</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-700 leading-relaxed font-medium">
                  {unansweredReviews.length > 0 ? (
                    <p>
                      💬 You have <span className="text-[#C84B31] font-bold">{unansweredReviews.length} unanswered reviews</span>. Promptly replying to reviews increases customer return rates by 22%.
                    </p>
                  ) : (
                    <p>
                      ✅ Stellar job! 100% of customer reviews have been replied to by the Chef.
                    </p>
                  )}
                  {latestReview ? (
                    <p>
                      💬 {latestReview.userName} gave a {latestReview.rating}-star review: "{latestReview.comment.length > 65 ? latestReview.comment.slice(0, 65) + '...' : latestReview.comment}". Consider offering loyalty rewards.
                    </p>
                  ) : (
                    <p>
                      💬 Customer feedback is excellent. Maintain high service quality during weekend dining slots.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Parchment Quote */}
            <div className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-2xl p-4.5 flex gap-3.5 text-xs text-[#8C5D3A] leading-relaxed italic shadow-xs">
              <Sparkles size={20} className="text-[#C89D5E] shrink-0 mt-0.5" />
              <p>
                {outOfStockItems.length > 0 ? (
                  `"My Lord Maharaja, the royal kitchen is currently short of active supplies. Restocking ${outOfStockItems[0].name} is your highest priority to maintain the royal banquet."`
                ) : outOfStockSpecials.length > 0 ? (
                  `"My Lord Maharaja, the royal dining chamber is out of active chef specials. Please restock ingredients for ${outOfStockSpecials[0].name} immediately."`
                ) : (
                  `"My Lord Maharaja, the royal dining chamber is operating at optimum capacity. Turnaround speeds are steady, and guests are highly praising the spice balances."`
                )}
              </p>
            </div>
          </section>
        )}
          </motion.div>
        </AnimatePresence>

        {/* Global Notice */}
        <footer className="bg-[#FFFDF9] border border-[#E8DCC4] rounded-2xl p-4 flex gap-3 text-xs text-[#8C5D3A] leading-relaxed select-none shrink-0 shadow-xs">
          <Info size={16} className="text-[#C89D5E] shrink-0 mt-0.5" />
          <p className="font-medium">
            Pricing edits, stock availability, order progression, and chef replies made in this console will instantly reflect on any active customer devices browsing the Maharaja restaurant app.
          </p>
        </footer>
      </main>
    </div>
  );
}
