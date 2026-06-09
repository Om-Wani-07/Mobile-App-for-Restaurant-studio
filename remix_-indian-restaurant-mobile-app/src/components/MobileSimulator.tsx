import React, { useState, useEffect } from "react";
import { 
  Compass, 
  ShoppingBag, 
  CalendarDays, 
  Receipt, 
  Award, 
  ShieldAlert, 
  Wifi, 
  WifiOff,
  Battery, 
  Smartphone,
  Eye,
  Settings
} from "lucide-react";
import { Screen } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MobileSimulatorProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  cartCount: number;
  points: number;
  tier: string;
  role: "customer" | "owner";
  setRole: (role: "customer" | "owner") => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  showSyncToast?: boolean;
  lastSyncCount?: number;
  children: React.ReactNode;
}

export default function MobileSimulator({
  currentScreen,
  onNavigate,
  cartCount,
  points,
  tier,
  role,
  setRole,
  isOffline,
  onToggleOffline,
  showSyncToast,
  lastSyncCount,
  children
}: MobileSimulatorProps) {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      setTime(`${hours}:${minutes} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Determine active slot based on Screen type
  const getActiveTab = () => {
    switch (currentScreen.type) {
      case "Discover":
      case "RestaurantMenu":
        return "discover";
      case "TableBookingScreen":
      case "BookingsList":
        return "bookings";
      case "Cart":
        return "cart";
      case "OrdersList":
      case "OrderTracking":
        return "orders";
      case "LoyaltyDashboard":
        return "loyalty";
      default:
        return "";
    }
  };

  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-6 px-4 font-sans selection:bg-amber-100 selection:text-amber-800">
      {/* Dev / Admin Role Switcher Banner */}
      <div className="mb-4 w-full max-w-sm flex flex-col gap-2.5 bg-white px-4 py-3 rounded-2xl shadow-xs border border-gray-100 text-xs text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-bold text-gray-800 text-xs">
            <Eye size={14} className="text-amber-500" />
            <span>Simulation Workspace</span>
          </div>

          {/* Quick Simulated Offline Toggle */}
          <button
            onClick={onToggleOffline}
            className={`px-2 py-1 rounded-lg border font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer ${
              isOffline
                ? "bg-rose-50 border-rose-200 text-rose-700 font-extrabold animate-pulse"
                : "bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100"
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff size={11} className="stroke-[2.5]" />
                <span>Offline simulated</span>
              </>
            ) : (
              <>
                <Wifi size={11} className="stroke-[2.5]" />
                <span>Online simulated</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-2.5">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Persona</span>
          <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button 
              id="role-cust-btn"
              onClick={() => setRole("customer")}
              className={`px-2.5 py-1 rounded-md transition-all font-medium cursor-pointer ${
                role === "customer" 
                  ? "bg-white text-amber-700 shadow-xs" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Customer
            </button>
            <button 
              id="role-owner-btn"
              onClick={() => {
                setRole("owner");
                onNavigate({ type: "OwnerConsole" });
              }}
              className={`px-2.5 py-1 rounded-md transition-all font-medium flex items-center gap-1 cursor-pointer ${
                role === "owner" 
                  ? "bg-amber-600 text-white shadow-xs" 
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              <Settings size={11} className={role === "owner" ? "animate-spin" : ""} />
              <span>Owner</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Bezel Smartphone Container */}
      <div className="relative w-full max-w-[400px] h-[820px] bg-black rounded-[50px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] p-3 border-[4px] border-gray-800 flex flex-col overflow-hidden">
        {/* Notch Speaker and Camera */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-6 bg-black rounded-b-2xl z-50 flex items-center justify-center gap-2">
          {/* Subtle Speaker Line */}
          <div className="w-12 h-1 bg-gray-800 rounded-full" />
          {/* Lens */}
          <div className="w-2.5 h-2.5 bg-gray-900 rounded-full ring-2 ring-gray-950" />
        </div>

        {/* Dynamic Status Bar */}
        <div className="w-full bg-white text-gray-900 pt-3 pb-1.5 px-6 flex justify-between items-center text-xs font-semibold select-none z-40 rounded-t-[38px] shrink-0 border-b border-gray-50">
          <span>{time}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-full ring-1 ring-amber-100 font-bold self-center">
              {tier} tier
            </span>
            {isOffline ? (
              <WifiOff size={13} className="text-rose-600 animate-pulse" />
            ) : (
              <Wifi size={13} className="text-emerald-600" />
            )}
            <Battery size={15} className="text-gray-800" />
          </div>
        </div>

        {/* Viewport Frame Content (Simulated Screen) */}
        <div className="flex-1 w-full bg-slate-50 flex flex-col relative overflow-hidden z-20">
          {/* Network Connection Offline Strip Banner */}
          {isOffline && (
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[10px] py-1.5 px-3 flex items-center justify-center gap-1.5 tracking-wider font-extrabold uppercase shrink-0 shadow-inner z-50">
              <WifiOff size={10} className="animate-bounce" />
              <span>Offline Mode • Browsing Cache</span>
            </div>
          )}

          {/* Core Synchronization Complete Toast Overlay */}
          <AnimatePresence>
            {showSyncToast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                className="absolute top-3 left-3 right-3 bg-slate-900 border border-emerald-500/30 text-white p-3 rounded-2xl shadow-[0_12px_24px_rgba(0,0,0,0.45)] z-50 flex items-start gap-2.5"
              >
                <div className="bg-emerald-500/20 p-1.5 rounded-xl border border-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                  <Wifi size={16} className="animate-pulse" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-mono leading-none mb-1">
                    ✦ Connection Synced
                  </span>
                  <p className="text-[10px] text-slate-300 leading-normal font-semibold">
                    Royal kitchen loaded <b>{lastSyncCount} offline draft(s)</b> directly to our active tandoors!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {children}

          {/* Persistent AI Saffron Sommelier FAB */}
          {currentScreen.type !== "AISommelier" && currentScreen.type !== "OwnerConsole" && (
            <motion.button
              id="sommelier-fab"
              onClick={() => onNavigate({ type: "AISommelier" })}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.12, rotate: 6 }}
              whileTap={{ scale: 0.95 }}
              className="absolute bottom-5 right-5 z-40 bg-gradient-to-tr from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white p-3 rounded-full shadow-[0_8px_20px_rgba(217,119,6,0.35)] cursor-pointer flex items-center justify-center border border-amber-400/20"
            >
              <div className="relative">
                <span className="text-xl leading-none">👳🏽‍♂️</span>
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-200 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300"></span>
                </span>
              </div>
            </motion.button>
          )}
        </div>

        {/* Navigation Tab Bar for simulated App */}
        <div className="w-full bg-white border-t border-gray-100 py-3 px-4 flex justify-between items-center z-40 rounded-b-[38px] shrink-0 select-none">
          <button
            id="tab-discover"
            onClick={() => onNavigate({ type: "Discover" })}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "discover" ? "text-amber-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Compass size={20} className={activeTab === "discover" ? "stroke-[2.5]" : "stroke-2"} />
            <span className="text-[10px] font-semibold">Discover</span>
          </button>

          <button
            id="tab-bookings"
            onClick={() => onNavigate({ type: "BookingsList" })}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "bookings" ? "text-amber-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <CalendarDays size={20} className={activeTab === "bookings" ? "stroke-[2.5]" : "stroke-2"} />
            <span className="text-[10px] font-semibold">Bookings</span>
          </button>

          {/* Centered Cart Bubble */}
          <button
            id="tab-cart"
            onClick={() => onNavigate({ type: "Cart" })}
            className={`relative flex flex-col items-center gap-1 transition-all ${
              activeTab === "cart" ? "text-amber-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className="relative">
              <ShoppingBag size={20} className={activeTab === "cart" ? "stroke-[2.5]" : "stroke-2"} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center border border-white animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold">Cart</span>
          </button>

          <button
            id="tab-orders"
            onClick={() => onNavigate({ type: "OrdersList" })}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "orders" ? "text-amber-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Receipt size={20} className={activeTab === "orders" ? "stroke-[2.5]" : "stroke-2"} />
            <span className="text-[10px] font-semibold">Orders</span>
          </button>

          <button
            id="tab-loyalty"
            onClick={() => onNavigate({ type: "LoyaltyDashboard" })}
            className={`flex flex-col items-center gap-1 transition-all ${
              activeTab === "loyalty" ? "text-amber-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Award size={20} className={activeTab === "loyalty" ? "stroke-[2.5]" : "stroke-2"} />
            <span className="text-[10px] font-semibold">Loyalty</span>
          </button>
        </div>

        {/* Physical Home Indicator bar */}
        <div className="w-full bg-white py-1.5 flex justify-center items-center z-50 shrink-0">
          <div className="w-28 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
      
      {/* Quick environment info */}
      <span className="mt-4 text-[11px] font-mono text-gray-400 select-none text-center max-w-xs">
        Local Storage Sync: Enabled • Points System: 1/₹10 • GST Tax: 18%
      </span>
    </div>
  );
}
