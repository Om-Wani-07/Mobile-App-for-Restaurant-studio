import React, { useState, useEffect } from "react";
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

  // New Tab Navigation: command | seating | reports | ai_advisor
  const [activeDashboardTab, setActiveDashboardTab] = useState<"command" | "seating" | "reports" | "ai_advisor">("command");

  // Inline replies states
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [tempReplyText, setTempReplyText] = useState("");

  // Assign Table inline state
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState("Table 1");
  const [vacantTableModalId, setVacantTableModalId] = useState<string | null>(null); // Visual Seating Board assign modal

  // Sync to local storage on changes
  useEffect(() => {
    localStorage.setItem("rsl_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("rsl_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("rsl_reviews", JSON.stringify(reviews));
  }, [reviews]);

  // Synchronize state changes made in the Customer view in real-time
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

  // Group dish quantity metrics
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

  // Menu items filter
  const activeRestItems = menuItems.filter(item => {
    const matchesRest = item.restaurantId === selectedRestId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRest && matchesSearch;
  });

  const restOrders = orders.filter(o => o.restaurantId === selectedRestId);
  const restBookings = bookings.filter(b => b.restaurantId === selectedRestId);
  const restReviews = reviews.filter(r => r.restaurantId === selectedRestId);

  // Category sales breakdown
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

  // Simulated Hourly Sales Data for line chart
  const hourlySales = [
    { hour: "12 PM", amount: 1200 },
    { hour: "2 PM", amount: 2400 },
    { hour: "4 PM", amount: 950 },
    { hour: "6 PM", amount: 4800 },
    { hour: "8 PM", amount: 7200 },
    { hour: "10 PM", amount: 5900 },
  ];

  return (
    <div 
      className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-600 selection:text-white"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      {/* Decorative Traditional Indian Royal Border Header Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-red-700 w-full" />

      {/* Top Navigation Header (Darbar Styling) */}
      <header className="bg-[#0e1628]/95 backdrop-blur-md border-b border-amber-900/20 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shadow-xl select-none shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-600 to-yellow-500 p-2.5 rounded-2xl shadow-[0_4px_15px_rgba(217,119,6,0.3)] text-white">
            <ChefHat size={26} />
          </div>
          <div className="flex flex-col">
            <h1 
              className="text-[10px] uppercase font-bold text-amber-500 tracking-[0.25em] leading-none"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              MAHARAJA ROYAL DARBAR
            </h1>
            <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 mt-0.5">
              Imperial Kitchen Console
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            </span>
          </div>
        </div>

        {/* Dashboard Tabs Selector */}
        <div className="flex bg-[#070b13] p-1.5 rounded-2xl border border-amber-900/10 gap-1">
          <button
            onClick={() => setActiveDashboardTab("command")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "command"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Utensils size={14} />
            <span>Darbar Command</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("seating")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "seating"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CalendarCheck size={14} />
            <span>Seating Board</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "reports"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <TrendingUp size={14} />
            <span>Imperial Reports</span>
          </button>
          <button
            onClick={() => setActiveDashboardTab("ai_advisor")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeDashboardTab === "ai_advisor"
                ? "bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-md"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles size={14} className="text-amber-300" />
            <span>AI Advisor</span>
          </button>
        </div>

        <button 
          onClick={navigateToCustomer}
          className="flex items-center gap-2 bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-red-950/20 cursor-pointer border border-red-900/35"
        >
          <LogOut size={14} className="rotate-180 text-red-200" />
          <span>Go to Customer App</span>
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl w-full mx-auto relative z-20">
        
        {/* Banner metrics across all tabs */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 select-none shrink-0">
          <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-1.5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Darbar Revenue</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              Live updates active
            </span>
          </div>

          <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-1.5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Tandoors Active</span>
              <ShoppingBag size={16} className="text-amber-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {activeOrdersCount}
            </span>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
              Pending Prep
            </span>
          </div>

          <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-1.5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Seating Capacity</span>
              <CalendarDays size={16} className="text-blue-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {seatedTablesCount} <span className="text-xs text-slate-400 font-normal">/ 12 Seated</span>
            </span>
            <div className="w-full bg-[#070b13] rounded-full h-1.5 mt-1 border border-slate-800 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-1.5 transition-all duration-500" 
                style={{ width: `${(seatedTablesCount / 12) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-1.5 relative overflow-hidden group">
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Gourmet Spots</span>
              <Layers size={16} className="text-indigo-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {restaurants.length} spots
            </span>
            <span className="text-[10px] text-indigo-400 font-semibold font-mono">
              Synchronized
            </span>
          </div>
        </section>

        {/* TAB 1: DARBAR COMMAND CONSOLE (MENU EDITOR + FEEDS) */}
        {activeDashboardTab === "command" && (
          <>
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              {/* Left Column: Menu Editor */}
              <section className="lg:col-span-6 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 flex flex-col gap-4 min-h-[450px] shadow-lg">
                <div className="flex flex-col gap-1 select-none">
                  <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                    <Utensils size={14} className="text-amber-500" />
                    Culinary Menu & Availability
                  </h3>
                  <p className="text-xs text-slate-400">
                    Update prices, toggles, and mark dishes as available in real-time.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3.5 top-3 text-slate-500" size={14} />
                    <input 
                      type="text" 
                      placeholder="Search delicacies (e.g. Paneer, Tikka)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-[#070b13] border border-amber-900/15 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-amber-600 transition-all font-medium"
                    />
                  </div>

                  <div className="relative">
                    <select
                      value={selectedRestId}
                      onChange={(e) => setSelectedRestId(parseInt(e.target.value))}
                      className="bg-[#070b13] border border-amber-900/15 rounded-xl py-2.5 px-3.5 pr-8 text-xs text-amber-500 font-bold focus:outline-none focus:border-amber-600 appearance-none cursor-pointer"
                    >
                      {restaurants.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-3 top-3.5 rotate-90 text-amber-500 pointer-events-none" />
                  </div>
                </div>

                {/* Culinary Dishes List */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5 max-h-[380px] [scrollbar-width:thin]">
                  {activeRestItems.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                      <Search size={28} className="text-slate-650 mb-2" />
                      <span className="text-xs text-slate-500 font-bold">No delicacies found</span>
                    </div>
                  ) : (
                    activeRestItems.map(item => (
                      <div 
                        key={item.id}
                        className={`p-3 rounded-2xl border transition-all flex justify-between items-center gap-3 ${
                          item.isAvailable === false
                            ? "bg-[#0c101b] border-red-950/20 opacity-55"
                            : "bg-[#070b13]/60 border-amber-900/5 hover:border-amber-900/15"
                        }`}
                      >
                        <div className="flex flex-col gap-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${item.isVeg ? "bg-emerald-500" : "bg-red-600"}`} />
                            <span className="text-xs font-bold text-slate-200 truncate">{item.name}</span>
                            {item.isAvailable === false && (
                              <span className="bg-red-950/40 text-red-400 border border-red-900/20 text-[8px] px-1.5 py-0.5 rounded-md font-bold font-mono">
                                SOLD OUT
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 capitalize font-mono">{item.category}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-xs">{item.description}</span>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          {/* Price Display / Editing */}
                          <div className="flex items-center gap-1.5">
                            {editingPriceId === item.id ? (
                              <div className="flex items-center gap-1 bg-[#090d16] border border-amber-900/20 rounded-lg p-0.5">
                                <span className="text-xs text-slate-450 font-mono pl-1">₹</span>
                                <input 
                                  type="text" 
                                  value={tempPrice}
                                  onChange={(e) => setTempPrice(e.target.value)}
                                  className="w-12 bg-transparent text-xs text-white focus:outline-none font-mono font-bold"
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
                                className="text-xs font-mono font-black text-amber-500 hover:underline cursor-pointer"
                                title="Click to edit price"
                              >
                                ₹{item.price}
                              </button>
                            )}
                          </div>

                          {/* Specials Toggle Switch */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Special</span>
                            <button
                              onClick={() => handleToggleSpecialOption(item.id, !item.isSpecial)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all ${
                                item.isSpecial ? "bg-amber-600" : "bg-slate-800"
                              }`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full transition-all ${item.isSpecial ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>

                          {/* Stock Toggle Switch */}
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">In Stock</span>
                            <button
                              onClick={() => handleToggleAvailability(item.id, item.isAvailable !== false ? false : true)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-all ${
                                item.isAvailable !== false ? "bg-emerald-600" : "bg-red-800"
                              }`}
                            >
                              <div className={`bg-white w-4 h-4 rounded-full transition-all ${item.isAvailable !== false ? "translate-x-4" : "translate-x-0"}`} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              {/* Right Column: Feeds */}
              <section className="lg:col-span-6 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 flex flex-col gap-4 shadow-lg">
                <div className="flex justify-between items-center select-none">
                  <div className="flex bg-[#070b13] p-1 rounded-xl border border-amber-900/10">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "orders" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Orders ({restOrders.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "bookings" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Bookings ({restBookings.length})
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "reviews" ? "bg-amber-600 text-white" : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      Reviews ({restReviews.length})
                    </button>
                  </div>
                  <span className="flex items-center gap-1.5 text-[9px] bg-emerald-950/30 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-900/20 font-bold uppercase tracking-wider">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live Feed
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 max-h-[380px] [scrollbar-width:thin]">
                  {/* Orders Feed */}
                  {activeTab === "orders" && (
                    restOrders.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <ShoppingBag size={28} className="text-slate-650 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No active orders placed</span>
                      </div>
                    ) : (
                      restOrders.map(order => (
                        <div key={order.id} className="bg-[#070b13]/60 border border-amber-900/5 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-200">Order #{order.id}</span>
                              <span className="text-[10px] text-slate-450 font-mono mt-0.5">
                                {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-xs font-mono font-black text-amber-500">₹{order.total}</span>
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full mt-1 ${
                                order.status === "Delivered"
                                  ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/10"
                                  : order.status === "Cancelled"
                                  ? "bg-red-950/30 text-red-450 border border-red-900/10"
                                  : "bg-amber-950/30 text-amber-500 border border-amber-900/10"
                              }`}>
                                {order.status}
                              </span>
                            </div>
                          </div>

                          <div className="text-xs text-slate-300 bg-[#0c1221] p-2.5 rounded-xl font-medium border border-amber-900/5">
                            {order.itemsSummary}
                          </div>

                          {order.status !== "Delivered" && order.status !== "Cancelled" && (
                            <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-900">
                              {order.status === "Placed" && (
                                <button 
                                  onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
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
                                className="bg-red-950/45 hover:bg-red-900/40 text-red-400 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-red-900/20"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )
                  )}

                  {/* Bookings Feed */}
                  {activeTab === "bookings" && (
                    restBookings.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <CalendarCheck size={28} className="text-slate-650 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No current table bookings</span>
                      </div>
                    ) : (
                      restBookings.map(booking => (
                        <div key={booking.id} className="bg-[#070b13]/60 border border-amber-900/5 rounded-2xl p-4 flex flex-col gap-3">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-200">{booking.guestName}</span>
                              <span className="text-[10px] text-slate-450 font-mono mt-0.5">
                                {booking.guestPhone} • {booking.numGuests} guests
                              </span>
                            </div>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                              booking.status === "Confirmed" || booking.status === "Seated"
                                ? "bg-emerald-950/30 text-emerald-400 border border-emerald-900/10"
                                : booking.status === "Cancelled" || booking.status === "Declined"
                                ? "bg-red-950/30 text-red-450 border border-red-900/10"
                                : "bg-amber-950/30 text-amber-500 border border-amber-900/10"
                            }`}>
                              {booking.status} {booking.tableNumber ? `(${booking.tableNumber})` : ""}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0c1221] p-2.5 rounded-xl border border-amber-900/5 font-semibold text-slate-350">
                            <div>Date: <span className="text-slate-200 font-bold">{booking.date}</span></div>
                            <div>Time: <span className="text-slate-200 font-bold">{booking.time}</span></div>
                            <div>Seating: <span className="text-slate-200 font-bold capitalize">{booking.seatingArea}</span></div>
                            {booking.specialRequest && (
                              <div className="col-span-2 mt-1 pt-1 border-t border-slate-900/60 truncate text-slate-400">
                                Request: "{booking.specialRequest}"
                              </div>
                            )}
                          </div>

                          {booking.status === "Pending" && (
                            <div className="flex gap-2 pt-1 border-t border-slate-900">
                              {assigningBookingId === booking.id ? (
                                <div className="flex-1 flex gap-2 items-center">
                                  <select
                                    value={selectedTable}
                                    onChange={(e) => setSelectedTable(e.target.value)}
                                    className="bg-[#090d16] border border-amber-900/15 rounded-lg py-1.5 px-2.5 text-xs text-white focus:outline-none"
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
                                    className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 cursor-pointer"
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
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer text-center"
                                  >
                                    Approve & Assign Table
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateBookingStatus(booking.id, "Declined")}
                                    className="bg-red-950/45 hover:bg-red-900/40 text-red-400 font-bold text-[10px] py-1.5 px-3 rounded-lg transition-all cursor-pointer border border-red-900/20"
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

                  {/* Reviews Feed */}
                  {activeTab === "reviews" && (
                    restReviews.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <MessageSquare size={28} className="text-slate-650 mb-2" />
                        <span className="text-xs text-slate-500 font-bold">No customer reviews written</span>
                      </div>
                    ) : (
                      restReviews.map(review => (
                        <div key={review.id} className="bg-[#070b13]/60 border border-amber-900/5 rounded-2xl p-4 flex flex-col gap-2.5">
                          <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-slate-200">{review.userName}</span>
                              <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                                {new Date(review.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-xs font-black text-amber-500">★ {review.rating} / 5</span>
                          </div>

                          <p className="text-xs text-slate-350 italic font-medium leading-relaxed">
                            "{review.comment}"
                          </p>

                          {review.chefResponse ? (
                            <div className="bg-[#1c1212]/30 border border-red-900/15 rounded-xl p-3 flex flex-col gap-1 mt-1">
                              <span className="text-[8px] uppercase tracking-wider font-bold text-amber-500">Chef Response Sent:</span>
                              <p className="text-xs text-amber-400 font-medium italic">
                                "{review.chefResponse}"
                              </p>
                            </div>
                          ) : replyingReviewId === review.id ? (
                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-900">
                              <textarea
                                value={tempReplyText}
                                onChange={(e) => setTempReplyText(e.target.value)}
                                placeholder="Write a royal hospitality note..."
                                rows={2}
                                className="w-full bg-[#090d16] border border-amber-900/15 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-600 placeholder-slate-600 resize-none font-medium"
                              />
                              <div className="flex gap-2 justify-end">
                                <button
                                  onClick={() => handleSendChefReply(review.id)}
                                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] py-1.5 px-4 rounded-lg cursor-pointer"
                                >
                                  Submit Reply
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyingReviewId(null);
                                    setTempReplyText("");
                                  }}
                                  className="text-slate-400 hover:text-slate-200 text-xs font-semibold px-2 cursor-pointer"
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
                              className="flex items-center gap-1.5 text-slate-400 hover:text-amber-500 text-[10px] font-bold mt-1 self-start cursor-pointer transition-all"
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

            {/* Bottom Section: Top Dishes & assignments summary */}
            <section className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 select-none shrink-0 shadow-lg">
              {/* Top Selling Dishes Panel */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-amber-500" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Top Ordered Gourmet Dishes
                  </h3>
                </div>
                <div className="bg-[#070b13]/60 rounded-2xl border border-amber-900/5 p-4 divide-y divide-slate-900">
                  {sortedTopDishes.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 font-medium">
                      Waiting for sales data to aggregate...
                    </div>
                  ) : (
                    sortedTopDishes.map(([dishName, stats], i) => (
                      <div key={dishName} className="flex justify-between items-center py-2.5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono text-xs font-bold text-amber-500">#{i + 1}</span>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                              <span className={`h-1.5 w-1.5 rounded-full ${stats.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                              {dishName}
                            </span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">
                              ₹{stats.totalRev.toLocaleString("en-IN")} total sales
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-xs font-black text-white bg-[#0e1628] px-2.5 py-0.5 rounded border border-amber-900/10">
                          {stats.qty} sold
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Dining Table Capacity Allocation Status */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <CalendarCheck size={16} className="text-blue-400" />
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                    Live Banquet Table Assignments
                  </h3>
                </div>
                <div className="bg-[#070b13]/60 rounded-2xl border border-amber-900/5 p-4 flex flex-col gap-2">
                  <span className="text-[9.5px] uppercase font-bold text-slate-450 font-mono tracking-wider">Active Assignments:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {tablesOptions.map(table => {
                      const isAssigned = bookings.some(b => b.tableNumber === table && (b.status === "Confirmed" || b.status === "Seated"));
                      const isSeated = bookings.some(b => b.tableNumber === table && b.status === "Seated");
                      return (
                        <div 
                          key={table}
                          className={`rounded-xl border p-2 flex flex-col items-center justify-center gap-1 text-[10px] font-bold font-mono transition-all ${
                            isSeated 
                              ? "bg-purple-500/10 border-purple-500/35 text-purple-400 ring-1 ring-purple-500/20"
                              : isAssigned
                              ? "bg-blue-500/10 border-blue-500/35 text-blue-400"
                              : "bg-[#070b13] border-slate-900 text-slate-600"
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

        {/* TAB 2: VISUAL SEATING PLANNER (ADVANCED FEATURE) */}
        {activeDashboardTab === "seating" && (
          <section className="flex-1 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-6 flex flex-col gap-6 shadow-lg relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <CalendarCheck size={18} className="text-amber-500" />
                  Royal Pavilion Seating Planner
                </h3>
                <p className="text-xs text-slate-400">
                  Manage active tables layout. Click on vacant tables to assign pending reservations, or seat and release occupied tables.
                </p>
              </div>

              {/* Legend indicators */}
              <div className="flex gap-4 text-[10px] font-bold font-mono bg-[#070b13] px-3.5 py-1.5 rounded-xl border border-amber-900/10 shrink-0">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" /> Vacant
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Reserved
                </span>
                <span className="flex items-center gap-1.5 text-purple-400">
                  <span className="h-2 w-2 rounded-full bg-purple-500" /> Seated
                </span>
              </div>
            </div>

            {/* Seating Map Layout Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tablesOptions.map(table => {
                // Find active bookings on this table
                const activeBooking = bookings.find(b => b.tableNumber === table && (b.status === "Confirmed" || b.status === "Seated"));
                const status = activeBooking ? activeBooking.status : "Vacant";

                return (
                  <div 
                    key={table}
                    className={`rounded-2xl border p-4.5 flex flex-col justify-between min-h-[160px] transition-all relative overflow-hidden group ${
                      status === "Seated"
                        ? "bg-purple-950/20 border-purple-500/30 text-purple-200 ring-1 ring-purple-500/10 shadow-purple-950/10"
                        : status === "Confirmed"
                        ? "bg-blue-950/20 border-blue-500/30 text-blue-200 shadow-blue-950/10"
                        : "bg-[#070b13]/80 border-amber-900/10 hover:border-amber-500/30 text-slate-450 hover:shadow-lg transition-all"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2 select-none">
                      <span className="text-lg font-black tracking-tight text-white">{table}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full font-mono ${
                        status === "Seated"
                          ? "bg-purple-500/20 text-purple-300"
                          : status === "Confirmed"
                          ? "bg-blue-500/20 text-blue-300"
                          : "bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {status === "Seated" ? "SEATED" : status === "Confirmed" ? "RESERVED" : "VACANT"}
                      </span>
                    </div>

                    {/* Customer Info when Occupied/Reserved */}
                    {activeBooking ? (
                      <div className="flex flex-col gap-1 mt-1 text-[11px]">
                        <span className="font-bold text-slate-100 flex items-center gap-1.5">
                          <User size={11} className="text-slate-450" />
                          {activeBooking.guestName}
                        </span>
                        <span className="text-slate-400 font-mono text-[10px]">
                          📱 {activeBooking.guestPhone}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1.5 font-semibold mt-1">
                          👥 {activeBooking.numGuests} guests • {activeBooking.time}
                        </span>
                        {activeBooking.specialRequest && (
                          <span className="text-[9.5px] italic text-amber-500/80 truncate mt-1">
                            " {activeBooking.specialRequest} "
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-4 text-center select-none text-[10px] text-slate-500">
                        <Utensils size={18} className="text-slate-700 mb-1" />
                        <span>Ready for guests</span>
                      </div>
                    )}

                    {/* Actions on Table card */}
                    <div className="mt-3.5 pt-2 border-t border-slate-900 flex gap-2">
                      {status === "Vacant" ? (
                        <button
                          onClick={() => setVacantTableModalId(table)}
                          className="w-full bg-[#0e1628] hover:bg-amber-600/90 text-slate-300 hover:text-white font-bold text-[10px] py-1.5 rounded-lg border border-amber-900/15 cursor-pointer text-center transition-all"
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
                            className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold text-[10px] p-1.5 rounded-lg cursor-pointer text-center border border-slate-800"
                            title="Release Reservation"
                          >
                            Release
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleUpdateBookingStatus(activeBooking.id, "Completed")}
                          className="w-full bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white font-bold text-[10px] py-1.5 rounded-lg cursor-pointer text-center transition-all"
                        >
                          Mark Completed / Vacate
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Assign Reservation Modal / Selector Drawer */}
            {vacantTableModalId && (
              <div className="absolute inset-0 bg-[#070b13]/85 backdrop-blur-xs flex items-center justify-center p-4 z-40 rounded-3xl select-none">
                <div className="bg-[#0e1628] border border-amber-900/30 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 animate-scale-up">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Assign Booking to {vacantTableModalId}
                    </h4>
                    <button
                      onClick={() => setVacantTableModalId(null)}
                      className="text-slate-400 hover:text-slate-200 text-xs font-bold font-mono cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 leading-normal">
                    Select a reservation to assign to {vacantTableModalId}. Confirmed reservations will automatically seat in real-time.
                  </p>

                  <div className="flex-1 overflow-y-auto max-h-[200px] flex flex-col gap-2 [scrollbar-width:thin]">
                    {bookings.filter(b => b.status === "Pending").length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-500 font-bold">
                        No pending bookings needing assignment
                      </div>
                    ) : (
                      bookings.filter(b => b.status === "Pending").map(b => (
                        <div 
                          key={b.id}
                          onClick={() => handleConfirmBooking(b.id, vacantTableModalId)}
                          className="bg-[#070b13] border border-amber-900/10 hover:border-amber-600/40 rounded-xl p-3 flex justify-between items-center cursor-pointer transition-all hover:bg-[#0d1322]"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-xs font-bold text-slate-200">{b.guestName}</span>
                            <span className="text-[10px] text-slate-500 font-mono">👥 {b.numGuests} guests • {b.time}</span>
                          </div>
                          <ChevronRight size={14} className="text-amber-500" />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* TAB 3: IMPERIAL REPORTS & SALES GRAPHS (HELPFUL DASHBOARD) */}
        {activeDashboardTab === "reports" && (
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Charts section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              
              {/* Sales trend line graph (Span 7) */}
              <section className="lg:col-span-7 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-4">
                <div className="flex justify-between items-center select-none">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Daily Sales Distribution
                    </h3>
                    <p className="text-[10px] text-slate-400">Hourly revenue trends of peak dinner rush</p>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-amber-500">₹7.2K PEAK</span>
                </div>

                {/* SVG Line Graph */}
                <div className="h-60 bg-[#070b13] rounded-2xl border border-amber-900/5 p-4 flex flex-col justify-between relative overflow-hidden">
                  <svg className="w-full h-44 mt-4 overflow-visible" viewBox="0 0 500 150">
                    <defs>
                      <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d97706" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#d97706" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    <line x1="0" y1="30" x2="500" y2="30" stroke="#0e1628" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="75" x2="500" y2="75" stroke="#0e1628" strokeWidth="1" strokeDasharray="4" />
                    <line x1="0" y1="120" x2="500" y2="120" stroke="#0e1628" strokeWidth="1" strokeDasharray="4" />

                    {/* Gradient area beneath path */}
                    <path
                      d="M 10 140 L 10 120 L 100 90 L 190 125 L 280 40 L 370 10 L 460 30 L 460 140 Z"
                      fill="url(#goldGradient)"
                    />

                    {/* Elegant Golden Line Path */}
                    <path
                      d="M 10 120 Q 55 105 100 90 T 190 125 T 280 40 T 370 10 T 460 30"
                      fill="none"
                      stroke="url(#chartLineGrad)"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <linearGradient id="chartLineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="50%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#851010" />
                    </linearGradient>

                    {/* Circle markers */}
                    <circle cx="10" cy="120" r="4.5" fill="#ea580c" stroke="#070b13" strokeWidth="1.5" className="hover:scale-125 transition-all" />
                    <circle cx="100" cy="90" r="4.5" fill="#eab308" stroke="#070b13" strokeWidth="1.5" />
                    <circle cx="190" cy="125" r="4.5" fill="#ea580c" stroke="#070b13" strokeWidth="1.5" />
                    <circle cx="280" cy="40" r="4.5" fill="#eab308" stroke="#070b13" strokeWidth="1.5" />
                    <circle cx="370" cy="10" r="4.5" fill="#851010" stroke="#070b13" strokeWidth="1.5" />
                    <circle cx="460" cy="30" r="4.5" fill="#eab308" stroke="#070b13" strokeWidth="1.5" />
                  </svg>

                  {/* Hourly labels */}
                  <div className="flex justify-between text-[9px] font-bold font-mono text-slate-500 px-1 border-t border-slate-900 pt-2 shrink-0">
                    <span>12:00 PM</span>
                    <span>2:00 PM</span>
                    <span>4:00 PM</span>
                    <span>6:00 PM</span>
                    <span>8:00 PM</span>
                    <span>10:00 PM</span>
                  </div>
                </div>
              </section>

              {/* Category distribution bar chart (Span 5) */}
              <section className="lg:col-span-5 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 shadow-lg flex flex-col gap-4">
                <div className="flex justify-between items-center select-none">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                      Popularity by Category
                    </h3>
                    <p className="text-[10px] text-slate-400">Total dish sales breakdown</p>
                  </div>
                </div>

                {/* Vertical category bars */}
                <div className="flex-1 bg-[#070b13] rounded-2xl border border-amber-900/5 p-4 flex flex-col gap-3.5 justify-center">
                  {Object.entries(categorySales).map(([category, count]) => (
                    <div key={category} className="flex flex-col gap-1 select-none">
                      <div className="flex justify-between text-[10px] font-bold font-mono text-slate-300">
                        <span>{category}</span>
                        <span className="text-amber-500">{count} sold</span>
                      </div>
                      <div className="w-full bg-[#0e1628] rounded-full h-2.5 overflow-hidden border border-slate-800">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-yellow-500 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${(count / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 select-none shadow-sm">
              <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 flex flex-col gap-2">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Average Ticket Value</span>
                <span className="text-xl font-mono font-black text-white">
                  ₹{orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0}
                </span>
                <p className="text-[10px] text-slate-400">Average spending per order checkout</p>
              </div>

              <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 flex flex-col gap-2">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Busiest Hour</span>
                <span className="text-xl font-bold text-amber-500 uppercase tracking-wide">08:00 - 09:00 PM</span>
                <p className="text-[10px] text-slate-400">Peak hour for dining reservations</p>
              </div>

              <div className="bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-5 flex flex-col gap-2">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 font-mono tracking-wider">Turnaround Time</span>
                <span className="text-xl font-mono font-black text-white">55 Mins</span>
                <p className="text-[10px] text-slate-400">Average duration of a table reservation</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: AI DARBAR ADVISOR (INTELLIGENT INSIGHTS) */}
        {activeDashboardTab === "ai_advisor" && (
          <section className="flex-1 bg-[#0e1628]/80 backdrop-blur-md rounded-3xl border border-amber-900/10 p-6 flex flex-col gap-6 shadow-lg relative overflow-hidden select-none">
            {/* Ambient gold glow */}
            <div className="absolute right-0 top-0 h-44 w-44 bg-amber-500/5 blur-3xl rounded-full" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-500 animate-pulse" />
                  Royal Darbar AI Advisor
                </h3>
                <p className="text-xs text-slate-400">
                  Daily operation intelligence generated from real-time customer menus, orders, and review comments.
                </p>
              </div>

              <span className="text-[10px] bg-amber-950/30 text-amber-400 border border-amber-900/20 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                👑 Maharaja Insights
              </span>
            </div>

            {/* AI Advisor content layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Culinary Pricing Recommendations */}
              <div className="bg-[#070b13] border border-amber-900/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Award size={18} className="text-amber-500" />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Culinary Recommendations</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-350 leading-relaxed font-medium">
                  <p>
                    👑 <b className="text-amber-400">Hyderabadi Dum Biryani</b> sales have climbed by <span className="text-emerald-400">18%</span>. We recommend marking it as a **Chef Special** to increase visibility.
                  </p>
                  <p>
                    💰 Gourmet menu audits suggest adjusting pricing of **Tandoori Saffron Paneer Tikka** from ₹340 to ₹365 to optimize margins, as it holds a <span className="text-amber-500 font-bold">4.7 rating</span>.
                  </p>
                </div>
              </div>

              {/* Card 2: Kitchen Health & Restock Warning */}
              <div className="bg-[#070b13] border border-amber-900/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-red-500" />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Kitchen Health Alerts</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-350 leading-relaxed font-medium">
                  <p>
                    ⚠️ Your kitchen is currently running <span className="text-red-400 font-bold">1 item out of stock</span> (Paneer Tikka). Customers looking at Saffron Taj menu see a "Sold Out" banner.
                  </p>
                  <p>
                    🥘 Butter Chicken is ordered in <span className="text-amber-400 font-bold">45% of orders</span>. Restock active stocks of fresh saffron and butter cream before the weekend dinner peak.
                  </p>
                </div>
              </div>

              {/* Card 3: Customer Hospitality & Reviews */}
              <div className="bg-[#070b13] border border-amber-900/10 rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-blue-400" />
                  <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">Hospitality Insights</span>
                </div>
                <div className="flex flex-col gap-3 text-xs text-slate-350 leading-relaxed font-medium">
                  <p>
                    💬 You have <span className="text-amber-400 font-bold">{reviews.filter(r => !r.chefResponse).length} reviews</span> without a Chef Response. Promptly replying to reviews increases customer return rates by 22%.
                  </p>
                  <p>
                    💬 Rahul Sharma gave a 5-star review about soft saffron paneer. Consider offering a loyalty bonus code to return patrons.
                  </p>
                </div>
              </div>
            </div>

            {/* Advisor decorative quote */}
            <div className="bg-amber-950/10 border border-amber-900/20 rounded-2xl p-4.5 flex gap-3.5 text-xs text-amber-400/90 leading-relaxed italic">
              <Sparkles size={20} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                "My Lord Maharaja, the royal dining chamber is operating at optimum capacity. Turnaround speeds are steady, and guests are highly praising the spice balances. Keeping Paneer Tikka stocked is your highest priority today."
              </p>
            </div>
          </section>
        )}

        {/* Global info footer notice */}
        <footer className="bg-amber-950/20 border border-amber-900/15 rounded-2xl p-4 flex gap-3 text-xs text-amber-400 leading-relaxed select-none shrink-0">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="font-medium">
            Pricing edits, stock availability, order progression, and chef replies made in this console will instantly reflect on any active customer devices browsing the Maharaja restaurant app.
          </p>
        </footer>
      </main>
    </div>
  );
}
