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
  ChevronRight
} from "lucide-react";
import { Restaurant, MenuItem, FoodOrder, TableBooking, Review } from "./types";
import { initialRestaurants, initialMenuItems, initialReviews } from "./data";
import { useBookings } from "./hooks/useBookings";
import { useOrders } from "./hooks/useOrders";

export default function OwnerApp() {
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

  // Inline replies states
  const [replyingReviewId, setReplyingReviewId] = useState<number | null>(null);
  const [tempReplyText, setTempReplyText] = useState("");

  // Assign Table inline state
  const [assigningBookingId, setAssigningBookingId] = useState<number | null>(null);
  const [selectedTable, setSelectedTable] = useState("Table 1");

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
        console.warn("Storage sync failed:", err);
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

  // --- Math Analytics Calculations ---
  const totalRevenue = orders.reduce((acc, curr) => curr.status !== "Cancelled" ? acc + curr.total : acc, 0);
  const totalBookingsCount = bookings.length;
  const activeOrdersCount = orders.filter(o => o.status === "Placed" || o.status === "Preparing" || o.status === "Out for Delivery").length;

  // Active Seated Tables Count
  const seatedTablesCount = bookings.filter(b => b.status === "Seated").length;

  // Top Selling Dishes Calculation
  const dishCounts: { [name: string]: { qty: number; totalRev: number; isVeg: boolean } } = {};
  orders.forEach(o => {
    if (o.status !== "Cancelled") {
      o.items.forEach(it => {
        const entry = dishCounts[it.menuItem.name] || { qty: 0, totalRev: 0, isVeg: it.menuItem.isVeg };
        entry.qty += it.quantity;
        entry.totalRev += it.menuItem.price * it.quantity;
        dishCounts[it.menuItem.name] = entry;
      });
    }
  });

  const sortedTopDishes = Object.entries(dishCounts)
    .sort((a, b) => b[1].qty - a[1].qty)
    .slice(0, 3);

  // Filtered Menu Items
  const activeRestItems = menuItems.filter(item => {
    const matchesRest = item.restaurantId === selectedRestId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRest && matchesSearch;
  });

  // Table numbering array options
  const tablesOptions = Array.from({ length: 12 }, (_, i) => `Table ${i + 1}`);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-4 flex justify-between items-center shadow-md select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20 text-amber-500">
            <ChefHat className="animate-pulse" size={24} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[10px] uppercase font-mono font-black text-amber-500 tracking-widest leading-none">
              MAHARAJA BACKOFFICE
            </h1>
            <span className="text-lg font-black tracking-tight text-white">
              Kitchen Admin Console
            </span>
          </div>
        </div>

        <button 
          onClick={navigateToCustomer}
          className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-amber-900/20 cursor-pointer"
        >
          <LogOut size={14} className="rotate-180" />
          <span>Go to Customer App</span>
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl w-full mx-auto">
        
        {/* Grid Analytics Metrics Cards */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 select-none shrink-0">
          {/* Total Revenue */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-sm flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Revenue</span>
              <TrendingUp size={16} className="text-emerald-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              ₹{totalRevenue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">
              Excluding cancelled orders
            </span>
          </div>

          {/* Active Orders */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-sm flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Pending Orders</span>
              <ShoppingBag size={16} className="text-amber-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {activeOrdersCount}
            </span>
            <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">
              Preparing & Shipped
            </span>
          </div>

          {/* Dining Seating capacity */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-sm flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Banquet Capacity</span>
              <CalendarDays size={16} className="text-blue-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {seatedTablesCount} <span className="text-xs text-slate-400 font-normal">/ 12 Seated</span>
            </span>
            <div className="w-full bg-slate-900 rounded-full h-1.5 mt-1 border border-slate-700 overflow-hidden">
              <div 
                className="bg-blue-500 h-1.5 transition-all duration-500" 
                style={{ width: `${(seatedTablesCount / 12) * 100}%` }}
              />
            </div>
          </div>

          {/* Active Eateries */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 p-5 shadow-sm flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-[10px] uppercase font-bold tracking-wider font-mono">Active Spots</span>
              <Layers size={16} className="text-indigo-400" />
            </div>
            <span className="text-2xl font-mono font-black text-white leading-none">
              {restaurants.length} spots
            </span>
            <span className="text-[10px] text-slate-400 font-semibold font-mono">
              Live sync active
            </span>
          </div>
        </section>

        {/* Workspace Layout split */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
          
          {/* COLUMN 1: Menu Editor & Inventory (Span 6) */}
          <section className="lg:col-span-6 bg-slate-800 rounded-3xl border border-slate-700 p-5 flex flex-col gap-4 min-h-[450px]">
            <div className="flex flex-col gap-1 select-none">
              <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                Restaurant Menu & Inventory
              </h3>
              <p className="text-xs text-slate-400">
                Update prices, specials, and mark dishes as Available/Sold Out in real-time
              </p>
            </div>

            {/* Selector Kitchen */}
            <div className="flex flex-col gap-1.5 select-none">
              <label className="text-[9px] uppercase font-bold text-slate-400 font-mono">Select Culinary Kitchen</label>
              <select
                id="owner-restaurant-select"
                value={selectedRestId}
                onChange={(e) => setSelectedRestId(parseInt(e.target.value))}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {restaurants.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Search filter input */}
            <div className="relative shrink-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                id="owner-dish-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dish or category (e.g. Appetizer, Mains, Dessert)..."
                className="w-full bg-slate-900 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            {/* Menu Items Table list */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-700/60 pr-1.5 [scrollbar-width:thin] [scrollbar-color:#334155_#1e293b]">
              {activeRestItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 font-medium">
                  No matching dishes found in this kitchen.
                </div>
              ) : (
                activeRestItems.map(item => (
                  <div key={item.id} className="flex flex-col gap-2 py-3 first:pt-0">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider font-mono">{item.category}</span>
                        <span className="text-xs font-bold text-white leading-snug flex items-center gap-1.5">
                          <span className={`h-2 w-2 rounded-full ${item.isVeg ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {item.name}
                        </span>
                      </div>

                      {/* Editing prices in-line */}
                      {editingPriceId === item.id ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-slate-400">₹</span>
                          <input 
                            id={`price-edit-input-${item.id}`}
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(e.target.value)}
                            className="w-16 bg-slate-950 border border-amber-500/50 rounded-lg px-2 py-1 text-xs font-mono font-bold text-white focus:outline-none"
                            placeholder={item.price.toString()}
                            autoFocus
                          />
                          <button
                            id={`save-price-btn-${item.id}`}
                            type="button"
                            onClick={() => handlePriceSave(item.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                            title="Save price"
                          >
                            <Check size={12} />
                          </button>
                        </div>
                      ) : (
                        <div 
                          onClick={() => {
                            setEditingPriceId(item.id);
                            setTempPrice(item.price.toString());
                          }}
                          className="flex flex-col items-end cursor-pointer group hover:opacity-85 select-none"
                        >
                          <span className="text-xs font-mono font-black text-amber-500 group-hover:underline">
                            ₹{item.price}
                          </span>
                          <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider font-sans">
                            Click to edit
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold gap-2">
                      <span className="flex items-center gap-1">
                        ★ {item.rating} <span className="text-[8px] text-slate-500 font-medium">({item.reviewCount})</span>
                      </span>

                      <div className="flex items-center gap-4 select-none">
                        {/* Signature Special toggle */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Special</span>
                          <button
                            id={`toggle-special-btn-${item.id}`}
                            type="button"
                            onClick={() => handleToggleSpecialOption(item.id, !item.isSpecial)}
                            className={`h-4.5 w-8 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              item.isSpecial ? "bg-amber-600 justify-end" : "bg-slate-700 justify-start"
                            }`}
                          >
                            <div className="h-3.5 w-3.5 rounded-full bg-white shadow-xs" />
                          </button>
                        </div>

                        {/* Availability toggle */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">In Stock</span>
                          <button
                            id={`toggle-avail-btn-${item.id}`}
                            type="button"
                            onClick={() => handleToggleAvailability(item.id, item.isAvailable === false)}
                            className={`h-4.5 w-8 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                              item.isAvailable !== false ? "bg-emerald-600 justify-end" : "bg-rose-700 justify-start"
                            }`}
                          >
                            <div className="h-3.5 w-3.5 rounded-full bg-white shadow-xs" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* COLUMN 2: Live Feed Feed Panels (Orders / Bookings / Reviews) (Span 6) */}
          <section className="lg:col-span-6 bg-slate-800 rounded-3xl border border-slate-700 p-5 flex flex-col gap-4 min-h-[450px]">
            {/* Tabs Selector Header */}
            <div className="flex justify-between items-center select-none border-b border-slate-700 pb-3 shrink-0 flex-wrap gap-2">
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700/60 text-xs">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === "orders" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Orders ({orders.length})
                </button>
                <button
                  onClick={() => setActiveTab("bookings")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === "bookings" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Bookings ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    activeTab === "reviews" ? "bg-amber-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Reviews ({reviews.length})
                </button>
              </div>
              
              <span className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 animate-pulse font-mono uppercase tracking-wider">
                <span className="h-1.5 w-1.5 bg-emerald-400 rounded-full"></span>
                <span>Live Feed</span>
              </span>
            </div>

            {/* Tab content displays */}
            <div className="flex-1 overflow-y-auto pr-1.5 [scrollbar-width:thin] [scrollbar-color:#334155_#1e293b]">
              
              {/* Tab 1: Orders Feed */}
              {activeTab === "orders" && (
                <div className="flex flex-col gap-3">
                  {orders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-medium">
                      No customer food orders have been placed yet.
                    </div>
                  ) : (
                    orders.map(order => (
                      <div key={order.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center text-xs select-none">
                          <span className="font-mono font-bold text-amber-500">Order ID: #{order.id}</span>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider font-mono">Kitchen</span>
                          <span className="text-xs font-bold text-slate-250">{order.restaurantName}</span>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider font-mono">Dishes Ordered</span>
                          <p className="text-xs text-slate-300 leading-snug">{order.itemsSummary}</p>
                        </div>
                        
                        {/* Order Management Actions bar */}
                        <div className="border-t border-slate-800/80 pt-3 mt-1.5 flex flex-col gap-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono">Current Status</span>
                            <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md ${
                              order.status === "Delivered" 
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                                : order.status === "Cancelled"
                                ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          {/* Transition buttons */}
                          {order.status !== "Delivered" && order.status !== "Cancelled" && (
                            <div className="flex gap-2 flex-wrap">
                              {order.status === "Placed" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Preparing")}
                                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                >
                                  Accept & Prepare
                                </button>
                              )}
                              {order.status === "Preparing" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Out for Delivery")}
                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                >
                                  Ship / Out for Delivery
                                </button>
                              )}
                              {order.status === "Out for Delivery" && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                >
                                  Mark Delivered
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                className="bg-slate-800 hover:bg-rose-950/40 text-slate-450 hover:text-rose-450 border border-slate-700/60 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer transition-colors"
                              >
                                Cancel Order
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 2: Bookings Feed */}
              {activeTab === "bookings" && (
                <div className="flex flex-col gap-3">
                  {bookings.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-medium">
                      No table reservations have been booked yet.
                    </div>
                  ) : (
                    bookings.map(booking => (
                      <div key={booking.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2.5">
                        <div className="flex justify-between items-center select-none text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-blue-400">Reservation #{booking.id}</span>
                            {booking.tableNumber && (
                              <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-mono px-2 py-0.5 rounded-md font-bold">
                                {booking.tableNumber}
                              </span>
                            )}
                          </div>
                          <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${
                            booking.status === "Cancelled" || booking.status === "Declined"
                              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                              : booking.status === "Confirmed"
                              ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                              : booking.status === "Seated"
                              ? "bg-purple-500/10 text-purple-400 border border-purple-500/20 animate-pulse"
                              : booking.status === "Completed"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Patron</span>
                            <span className="font-bold text-slate-200 flex items-center gap-1">
                              <User size={11} className="text-slate-450" />
                              {booking.guestName}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Schedule</span>
                            <span className="font-semibold text-slate-300 flex items-center gap-1 font-mono">
                              <Clock size={11} className="text-slate-450" />
                              {booking.date} @ {booking.time}
                            </span>
                          </div>
                          <div className="flex flex-col gap-0.5 col-span-2">
                            <span className="text-[9px] uppercase font-bold text-slate-500 font-mono tracking-wider">Eatery & Details</span>
                            <span className="font-bold text-slate-300 flex items-center gap-1 leading-none">
                              <MapPin size={11} className="text-slate-450" />
                              {booking.restaurantName} • {booking.numGuests} guests ({booking.seatingArea})
                            </span>
                          </div>
                        </div>

                        {booking.specialRequest && (
                          <div className="bg-slate-950/40 rounded-lg p-2 text-[10px] text-slate-400 italic font-medium border border-slate-800">
                            " {booking.specialRequest} "
                          </div>
                        )}

                        {/* Booking Reservation Status Management Action Flow */}
                        {booking.status !== "Cancelled" && booking.status !== "Completed" && booking.status !== "Declined" && (
                          <div className="border-t border-slate-800 pt-2.5 mt-1 flex flex-col gap-2">
                            {/* Inline Table Assignment selector */}
                            {assigningBookingId === booking.id ? (
                              <div className="flex gap-2 items-center bg-slate-950/50 p-2 rounded-xl border border-slate-800 animate-scale-in">
                                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">Select Table:</span>
                                <select 
                                  value={selectedTable}
                                  onChange={(e) => setSelectedTable(e.target.value)}
                                  className="bg-slate-900 text-xs border border-slate-700 rounded-lg px-2 py-1 font-mono font-bold focus:outline-none"
                                >
                                  {tablesOptions.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                  ))}
                                </select>
                                <button 
                                  onClick={() => handleConfirmBooking(booking.id, selectedTable)}
                                  className="ml-auto bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                >
                                  Confirm Table
                                </button>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                {booking.status === "Pending" && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        setAssigningBookingId(booking.id);
                                        setSelectedTable("Table 1");
                                      }}
                                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Approve & Assign Table
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateBookingStatus(booking.id, "Declined")}
                                      className="bg-slate-850 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Decline
                                    </button>
                                  </>
                                )}

                                {booking.status === "Confirmed" && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateBookingStatus(booking.id, "Seated")}
                                      className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Seat Guests
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateBookingStatus(booking.id, "Cancelled")}
                                      className="bg-slate-850 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 font-bold text-[10px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                )}

                                {booking.status === "Seated" && (
                                  <button 
                                    onClick={() => handleUpdateBookingStatus(booking.id, "Completed")}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                                  >
                                    Release & Free Table
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Tab 3: Reviews Feedback Replies Feed */}
              {activeTab === "reviews" && (
                <div className="flex flex-col gap-3">
                  {reviews.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-500 font-medium">
                      No reviews found.
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review.id} className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 flex flex-col gap-2">
                        <div className="flex justify-between items-center text-xs select-none">
                          <span className="font-bold text-white">{review.userName}</span>
                          <span className="text-amber-500 font-bold font-mono">
                            ★ {review.rating} / 5
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-500 font-mono">
                          {new Date(review.timestamp).toLocaleDateString()}
                        </p>

                        <p className="text-xs text-slate-350 italic leading-relaxed">
                          &ldquo;{review.comment}&rdquo;
                        </p>

                        {/* Chef Reply Displays */}
                        {review.chefResponse ? (
                          <div className="bg-amber-950/30 border border-amber-900/30 rounded-xl p-3 text-xs text-amber-400 leading-relaxed mt-1">
                            <span className="font-extrabold block text-[9px] uppercase tracking-wider font-mono text-amber-500 mb-0.5">
                              Chef Response Sent:
                            </span>
                            &ldquo;{review.chefResponse}&rdquo;
                          </div>
                        ) : replyingReviewId === review.id ? (
                          <div className="flex flex-col gap-2 mt-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 animate-scale-in">
                            <textarea
                              value={tempReplyText}
                              onChange={(e) => setTempReplyText(e.target.value)}
                              placeholder="Write a warm, custom response as the Executive Chef..."
                              rows={2}
                              className="bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs font-semibold text-white focus:outline-none placeholder-slate-600 focus:border-amber-500"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="bg-slate-800 text-slate-400 hover:text-white font-bold text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendChefReply(review.id)}
                                className="bg-amber-600 hover:bg-amber-500 text-white font-bold text-[9px] px-3.5 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer"
                              >
                                Send Reply
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(review.id);
                              setTempReplyText("");
                            }}
                            className="w-fit flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-slate-300 font-bold text-[9px] px-3 py-1.5 rounded-lg uppercase tracking-wider cursor-pointer mt-1.5 transition-all"
                          >
                            <MessageCircleReply size={11} className="text-amber-500" />
                            <span>Reply as Chef</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

        </div>

        {/* BOTTOM SECTION: Kitchen Analytics & Top Dishes Summary */}
        <section className="bg-slate-800 rounded-3xl border border-slate-700 p-5 grid grid-cols-1 md:grid-cols-2 gap-6 select-none shrink-0">
          {/* Top Selling Dishes Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Store size={16} className="text-amber-500" />
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                Top Ordered Gourmet Dishes
              </h3>
            </div>
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-4 divide-y divide-slate-800">
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
                    <span className="font-mono text-xs font-black text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-750">
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
            <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-4 flex flex-col gap-2">
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
                          ? "bg-purple-500/10 border-purple-500/30 text-purple-400 ring-1 ring-purple-500/20"
                          : isAssigned
                          ? "bg-blue-500/10 border-blue-500/30 text-blue-400"
                          : "bg-slate-850 border-slate-800 text-slate-600"
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

        {/* Global info footer notice */}
        <footer className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-4 flex gap-3 text-xs text-amber-400 leading-relaxed select-none shrink-0">
          <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <p className="font-medium">
            Pricing edits, stock availability, order progression, and chef replies made in this console will instantly reflect on any active customer devices browsing the Maharaja restaurant app.
          </p>
        </footer>
      </main>
    </div>
  );
}
