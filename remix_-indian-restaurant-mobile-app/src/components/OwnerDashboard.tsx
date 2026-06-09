import React, { useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  CalendarDays, 
  Award, 
  Search,
  Check,
  Eye,
  Settings,
  DollarSign,
  Briefcase,
  Layers,
  ChefHat,
  Star,
  Info
} from "lucide-react";
import { Restaurant, MenuItem, FoodOrder, TableBooking } from "../types";

interface OwnerDashboardProps {
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  bookings: TableBooking[];
  orders: FoodOrder[];
  onToggleSpecial: (itemId: number, isSpecial: boolean) => void;
  onUpdatePrice: (itemId: number, newPrice: number) => void;
}

export default function OwnerDashboard({
  restaurants,
  menuItems,
  bookings,
  orders,
  onToggleSpecial,
  onUpdatePrice
}: OwnerDashboardProps) {
  const [selectedRestId, setSelectedRestId] = useState(restaurants[0]?.id || 1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPriceId, setEditingPriceId] = useState<number | null>(null);
  const [tempPrice, setTempPrice] = useState("");

  const activeRest = restaurants.find(r => r.id === selectedRestId);

  // Math Analytics Calculations
  const totalRevenue = orders.reduce((acc, curr) => acc + curr.total, 0);
  const totalBookingsCount = bookings.length;
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length) : 0;
  
  // Menu items filter
  const activeRestItems = menuItems.filter(item => {
    const matchesRest = item.restaurantId === selectedRestId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRest && matchesSearch;
  });

  const handlePriceSave = (itemId: number) => {
    const parsed = parseFloat(tempPrice);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdatePrice(itemId, parsed);
      setEditingPriceId(null);
      setTempPrice("");
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-none bg-slate-100 [scrollbar-width:none]">
      {/* Backoffice Branding Header */}
      <div className="flex items-center gap-1.5 shrink-0 select-none">
        <ChefHat className="text-amber-600 animate-pulse" size={18} />
        <div className="flex flex-col">
          <h1 className="text-[10px] uppercase font-mono font-bold text-gray-500 tracking-widest leading-none">
            Maharaja Backoffice
          </h1>
          <span className="text-sm font-display font-black text-gray-900 tracking-tight">
            Kitchen Console
          </span>
        </div>
      </div>

      {/* Grid Analytics Metrics Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total revenue */}
        <div className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-3xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[9px] uppercase font-bold font-mono">Total Revenue</span>
            <TrendingUp size={12} className="text-emerald-500" />
          </div>
          <span className="text-base font-mono font-black text-gray-800 leading-none">
            ₹{totalRevenue.toFixed(0)}
          </span>
          <span className="text-[8px] text-gray-400 leading-none font-semibold">
            Across {orders.length} orders
          </span>
        </div>

        {/* Avg order checkout */}
        <div className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-3xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[9px] uppercase font-bold font-mono">Avg Checkout</span>
            <ShoppingBag size={12} className="text-amber-500" />
          </div>
          <span className="text-base font-mono font-black text-gray-800 leading-none">
            ₹{avgOrderValue.toFixed(0)}
          </span>
          <span className="text-[8px] text-gray-400 leading-none font-semibold font-mono">
            Basket summary value
          </span>
        </div>

        {/* Booked Seats */}
        <div className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-3xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[9px] uppercase font-bold font-mono">Booked tables</span>
            <CalendarDays size={12} className="text-blue-500" />
          </div>
          <span className="text-base font-mono font-black text-gray-800 leading-none">
            {totalBookingsCount}
          </span>
          <span className="text-[8px] text-blue-500 font-bold leading-none uppercase">
            BANQUET ALLOCATED
          </span>
        </div>

        {/* Restaurants headcount */}
        <div className="bg-white rounded-2xl border border-gray-150 p-3.5 shadow-3xs flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-gray-400">
            <span className="text-[9px] uppercase font-bold font-mono">Eateries Count</span>
            <Layers size={12} className="text-indigo-500" />
          </div>
          <span className="text-base font-mono font-black text-gray-800 leading-none">
            {restaurants.length} Spots
          </span>
          <span className="text-[8px] text-gray-450 leading-none font-semibold">
            Saffron, Dakshin, Claypot
          </span>
        </div>
      </div>

      {/* Menu Manager Section */}
      <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold text-gray-950 uppercase font-mono tracking-wider">
            Restaurant Menu Editor
          </h3>
          <p className="text-[10px] text-gray-400">
            Toggle signature status or adjust item price points dynamically
          </p>
        </div>

        {/* Selector Spot */}
        <div className="flex flex-col gap-1">
          <label className="text-[9px] uppercase font-bold text-gray-400">Filial Kitchen</label>
          <select
            id="owner-restaurant-select"
            value={selectedRestId}
            onChange={(e) => setSelectedRestId(parseInt(e.target.value))}
            className="bg-slate-50 border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden"
          >
            {restaurants.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </div>

        {/* Search inline */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
          <input 
            id="owner-dish-search"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dish, category e.g. Mains..."
            className="w-full bg-slate-50 pl-8 pr-3 py-1.5 rounded-xl text-[10px] font-semibold border border-gray-150 text-gray-800 focus:outline-hidden"
          />
        </div>

        {/* List of active restaurant dishes */}
        <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto divide-y divide-gray-50 [scrollbar-width:none]">
          {activeRestItems.map(item => (
            <div key={item.id} className="flex flex-col gap-2 pt-2.5 first:pt-0">
              <div className="flex justify-between items-start gap-1">
                <div className="flex flex-col">
                  {/* Category badge */}
                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</span>
                  <span className="text-xs font-bold text-gray-800 leading-tight">{item.name}</span>
                </div>

                {/* Edit price inline toggle trigger */}
                {editingPriceId === item.id ? (
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-mono text-slate-400">₹</span>
                    <input 
                      id={`price-edit-input-${item.id}`}
                      type="number"
                      value={tempPrice}
                      onChange={(e) => setTempPrice(e.target.value)}
                      className="w-14 bg-slate-50 border border-amber-300 rounded-md px-1 py-0.5 text-xs font-mono font-bold text-gray-800 focus:outline-hidden"
                      placeholder={item.price.toString()}
                    />
                    <button
                      id={`save-price-btn-${item.id}`}
                      type="button"
                      onClick={() => handlePriceSave(item.id)}
                      className="bg-emerald-600 text-white p-1 rounded-md text-[10px] font-bold hover:bg-emerald-700 transition-colors"
                      title="Save price"
                    >
                      <Check size={10} />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => {
                      setEditingPriceId(item.id);
                      setTempPrice(item.price.toString());
                    }}
                    className="flex flex-col items-end cursor-pointer group hover:opacity-80"
                  >
                    <span className="text-xs font-mono font-black text-amber-700 group-hover:underline">
                      ₹{item.price}
                    </span>
                    <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wider font-sans">
                      Click to edit
                    </span>
                  </div>
                )}
              </div>

              {/* Toggle indicators: isSpecial */}
              <div className="flex justify-between items-center text-[10px] text-gray-500 font-bold">
                <span className="flex items-center gap-0.5 font-sans">
                  ★ {item.rating} <span className="text-[8px] text-gray-300">({item.reviewCount} customer reviews)</span>
                </span>

                <div className="flex items-center gap-1.5 select-none">
                  <span className="text-[9px] uppercase font-bold text-slate-400">Featured Special</span>
                  <button
                    id={`toggle-special-btn-${item.id}`}
                    type="button"
                    onClick={() => onToggleSpecial(item.id, !item.isSpecial)}
                    className={`h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer flex items-center ${
                      item.isSpecial ? "bg-amber-600 justify-end" : "bg-gray-250 justify-start"
                    }`}
                  >
                    <div className="h-4 w-4 rounded-full bg-white shadow-xs" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 rounded-2xl p-4 border border-amber-250/30 flex gap-2.5 text-[10px] text-amber-800 leading-relaxed m-1">
        <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="font-semibold">
          Changing dish pricing or featured states in this Backoffice Console immediately restructures active menus, cart subtotals, and checkout invoices for the customer!
        </p>
      </div>
    </div>
  );
}
