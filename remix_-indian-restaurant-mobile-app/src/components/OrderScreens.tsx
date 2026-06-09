import React, { useState, useEffect } from "react";
import { 
  Receipt, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  Truck, 
  Flame, 
  PlusSquare, 
  Award, 
  ArrowLeft,
  Smartphone,
  ChevronRight,
  Info,
  Compass,
  MessageSquare,
  Sparkles,
  ThumbsUp
} from "lucide-react";
import { FoodOrder, Restaurant, Screen } from "../types";

interface OrderScreensProps {
  currentScreen: Screen;
  orders: FoodOrder[];
  restaurants: Restaurant[];
  onNavigateTo: (screen: Screen) => void;
  onNavigateBack: () => void;
}

export default function OrderScreens({
  currentScreen,
  orders,
  restaurants,
  onNavigateTo,
  onNavigateBack
}: OrderScreensProps) {
  // Local ticker for reactive status calculations on current view
  const [ticker, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker(t => t + 1);
    }, 2000); // Poll calculations every 2 seconds to make updates snappy
    return () => clearInterval(interval);
  }, []);

  // Helper function to resolve dynamic order status based on elapsed time
  const getDynamicOrderState = (order: FoodOrder) => {
    if (order.isOfflinePending) {
      return { 
        status: "Placed" as const, 
        detailMessage: "Draft saved locally. Connection offline - Waiting for network to dispatch to kitchens.", 
        percent: 0, 
        elapsedSeconds: 0 
      };
    }
    const elapsedSeconds = Math.floor((Date.now() - order.timestamp) / 1000);
    
    let status: "Placed" | "Preparing" | "Out for Delivery" | "Delivered" = "Placed";
    let detailMessage = "Curating authentic spices and royal ingredients.";
    let percent = 5;

    if (elapsedSeconds >= 60) {
      status = "Delivered";
      detailMessage = "Your royal feast has arrived! Bon Appétit!";
      percent = 100;
    } else if (elapsedSeconds >= 35) {
      status = "Out for Delivery";
      detailMessage = "Rider sprinting through local pathways with hot boxes.";
      percent = 70;
    } else if (elapsedSeconds >= 15) {
      status = "Preparing";
      detailMessage = "Clay oven fired! Roasting kebabs and stirring gravies.";
      percent = 35;
    }

    return { status, detailMessage, percent, elapsedSeconds };
  };

  // If tracking screen is active
  if (currentScreen.type === "OrderTracking") {
    const orderId = currentScreen.orderId;
    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return (
        <div className="flex-1 p-6 flex flex-col items-center justify-center text-center gap-3">
          <Info size={24} className="text-amber-500" />
          <span className="text-xs font-bold text-gray-700">Order not found</span>
          <button onClick={onNavigateBack} className="text-xs font-bold text-amber-600">
            Go Back
          </button>
        </div>
      );
    }

    const { status, detailMessage, percent, elapsedSeconds } = getDynamicOrderState(order);

    const steps = [
      { key: "Placed", title: "Placed", desc: "Order details received", icon: <Receipt size={14} /> },
      { key: "Preparing", title: "Kitchen Fire", desc: "Chef roasting kebabs", icon: <Flame size={14} /> },
      { key: "Out for Delivery", title: "In Transit", desc: "Rider hot boxes on-way", icon: <Truck size={14} /> },
      { key: "Delivered", title: "Enjoy Feast", desc: "Delivered safely with care", icon: <CheckCircle2 size={14} /> }
    ];

    const currentStepIndex = steps.findIndex(s => s.key === status);

    return (
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-none bg-slate-50 [scrollbar-width:none]">
        {/* Navigation title header */}
        <div className="flex items-center gap-3 shrink-0">
          <button 
            id="order-tracking-back-btn"
            onClick={() => onNavigateTo({ type: "OrdersList" })} 
            className="p-1.5 bg-white border border-gray-150 text-gray-700 rounded-lg active:scale-90 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
          </button>
          <div className="flex flex-col">
            <h1 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
              Order Dispatch Tracker
            </h1>
            <span className="text-[10px] font-mono font-bold text-amber-700">
              ID Reference: #RSL-{order.id}
            </span>
          </div>
        </div>

        {/* Dynamic progression top visual card */}
        <div className="bg-white rounded-3xl border border-gray-150 p-5 shadow-3xs flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-bold text-gray-400 font-mono">Simulated State</span>
              <span className="text-base font-display font-extrabold text-amber-700 animate-pulse uppercase leading-tight">
                {status}
              </span>
            </div>

            {status !== "Delivered" && (
              <span className="text-[10px] bg-slate-100 text-gray-600 font-mono px-2 py-1 rounded-lg font-bold">
                EST: {Math.max(0, 60 - elapsedSeconds)}s
              </span>
            )}
          </div>

          <p className="text-[11px] text-gray-600 font-medium leading-relaxed italic">
            &ldquo;{detailMessage}&rdquo;
          </p>

          {/* Simple progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-linear-to-r from-amber-500 to-emerald-600 transition-all duration-700 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Step-by-Step Vertical Milestones */}
        <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex flex-col gap-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Milestone Progress</h3>
          <div className="flex flex-col gap-4 relative pl-3">
            {/* Timeline connectors vertical line */}
            <div className="absolute left-6 top-3 bottom-8 w-0.5 bg-slate-100 z-10" />

            {steps.map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              
              return (
                <div key={s.key} className="flex gap-4 items-start z-20">
                  <div className={`h-6 w-6 rounded-lg flex items-center justify-center border ${
                    isCurrent 
                      ? "bg-amber-600 border-amber-600 text-white shadow-md scale-110" 
                      : isPast
                        ? "bg-emerald-50 border-emerald-150 text-emerald-600"
                        : "bg-slate-50 border-slate-150 text-slate-300"
                  }`}>
                    {s.icon}
                  </div>
                  <div className="flex flex-col flex-1 leading-tight">
                    <span className={`text-xs font-bold leading-tight ${isCurrent ? "text-amber-800" : isPast ? "text-gray-800" : "text-gray-300"}`}>
                      {s.title}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-0.5">{s.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items Summary */}
        <div className="bg-white rounded-3xl border border-gray-150 p-4 shadow-3xs flex flex-col gap-2">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Banquet Load details</h3>
          <p className="text-xs text-gray-800 leading-normal font-semibold">
            {order.itemsSummary}
          </p>
          <div className="pt-2.5 mt-2 border-t border-gray-100 flex justify-between items-center text-[11px] font-bold text-gray-500 font-mono">
            <span>Points Earned:</span>
            <span className="flex items-center gap-0.5 text-emerald-700">
              <Award size={10} />
              +{order.pointsEarned} pts
            </span>
          </div>
        </div>

        <button
          id="order-tracking-explore-btn"
          onClick={() => onNavigateTo({ type: "Discover" })}
          className="w-full bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs py-3 rounded-2xl flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-95 border border-slate-800"
        >
          <Compass size={13} />
          <span>Browse More Cuisines</span>
        </button>
      </div>
    );
  }

  // Otherwise, default to list view of all orders
  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 select-none bg-slate-50 [scrollbar-width:none]">
      <div className="flex flex-col gap-1 select-none">
        <h1 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
          Dining order archives
        </h1>
        <p className="text-[10px] text-gray-500 font-medium">
          Confirms and current dispatch progress of gourmet containers
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="flex-1 py-12 flex flex-col items-center justify-center text-center gap-3">
          <Receipt size={32} className="text-slate-300 stroke-1" />
          <span className="text-xs font-bold text-gray-600">No placed orders found</span>
          <span className="text-[10px] text-gray-400 max-w-[200px]">
            Savor Royal Butter Chicken or Pepper Dosa to begin dispatch records!
          </span>
          <button
            id="orders-browse-spot-btn"
            onClick={() => onNavigateTo({ type: "Discover" })}
            className="bg-amber-600 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-xl border border-amber-500 shadow-sm mt-1 cursor-pointer"
          >
            Browse spots
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {(() => {
            const getRatedOrderIds = (): number[] => {
              const saved = localStorage.getItem("rsl_completed_ratings");
              return saved ? JSON.parse(saved) : [];
            };
            const ratedIds = getRatedOrderIds();

            return (
              <>
                <div className="flex flex-col gap-3.5">
                  {orders.map(o => {
                    const dynamicState = getDynamicOrderState(o);
                    const isCompleted = dynamicState.status === "Delivered";
                    const isRated = ratedIds.includes(o.id);
                    
                    return (
                      <div 
                        key={o.id}
                        onClick={() => onNavigateTo({ type: "OrderTracking", orderId: o.id })}
                        className="bg-white rounded-3xl border border-gray-100 p-4 shadow-3xs cursor-pointer hover:border-amber-100 flex flex-col gap-3 transition-all scale-98 active:scale-95 group"
                      >
                        {/* Card header */}
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-gray-800 leading-tight">
                              {o.restaurantName}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">
                              Timestamp: {new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Dynamic Status pill */}
                          {o.isOfflinePending ? (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 animate-pulse font-mono flex items-center gap-0.5 shrink-0">
                              <span>📶 Draft Cache</span>
                            </span>
                          ) : (
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 border ${
                              isCompleted
                                ? "bg-slate-50 border-slate-100 text-gray-600"
                                : "bg-amber-50 border-amber-100 text-amber-700 animate-pulse"
                            }`}>
                              {!isCompleted && <Clock size={8} />}
                              <span>{dynamicState.status}</span>
                            </span>
                          )}
                        </div>

                        {/* Items Summary line */}
                        <p className="text-[10px] text-gray-500 line-clamp-1 font-medium">
                          {o.itemsSummary}
                        </p>

                        {/* Subfooter */}
                        <div className="pt-2 border-t border-gray-100 mt-1.5 flex justify-between items-center">
                          <span className="text-xs font-mono font-bold text-amber-700">
                            ₹{o.total.toFixed(2)}
                          </span>
                          
                          {isCompleted ? (
                            <div className="flex items-center gap-1.5">
                              {isRated ? (
                                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-md border border-emerald-100/60">
                                  ✓ Rated
                                </span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onNavigateTo({ type: "Feedback", orderId: o.id });
                                  }}
                                  className="text-[9px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2 py-0.5 rounded-md border border-amber-500 shadow-3xs cursor-pointer active:scale-95 transition-all"
                                >
                                  Rate Order
                                </button>
                              )}
                              <div className="text-[10px] bg-slate-50 px-2 py-0.5 rounded-md text-gray-650 font-bold flex items-center gap-0.5">
                                <span>Track</span>
                                <ChevronRight size={10} />
                              </div>
                            </div>
                          ) : (
                            <div className="text-[10px] bg-slate-50 px-2.5 py-1 rounded-xl text-gray-600 font-bold flex items-center gap-0.5 group-hover:bg-amber-50 group-hover:text-amber-700 transition-all">
                              <span>Track Dispatch</span>
                              <ChevronRight size={10} />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Big feedback section appearing after orders list */}
                {(() => {
                  const completedOrders = orders.filter(o => getDynamicOrderState(o).status === "Delivered");
                  const unratedCompleted = completedOrders.filter(o => !ratedIds.includes(o.id));
                  
                  if (completedOrders.length === 0) {
                    return null;
                  }

                  if (unratedCompleted.length > 0) {
                    const targetOrder = unratedCompleted[0];
                    return (
                      <div className="bg-linear-to-r from-amber-500/10 via-amber-600/5 to-transparent rounded-3xl border-2 border-dashed border-amber-500/20 p-5 mt-2 flex flex-col gap-3 relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-10 pointer-events-none text-amber-500">
                          <MessageSquare size={100} />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="bg-amber-500 text-white rounded-lg p-1.5 shrink-0">
                            <Sparkles size={14} className="animate-pulse" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-widest leading-none">Feast Experience Review</span>
                            <h4 className="text-xs font-black text-gray-800 mt-1">Rate Your Delivery Feast</h4>
                          </div>
                        </div>

                        <p className="text-[10px] font-semibold text-gray-500 leading-relaxed">
                          Savor sweet points and help us maintain royal quality! Rate your feast from <strong className="text-amber-800 font-bold">{targetOrder.restaurantName}</strong> using custom templates.
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTo({ type: "Feedback", orderId: targetOrder.id });
                          }}
                          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2.5 rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5 border border-amber-500 shadow-sm"
                        >
                          <MessageSquare size={12} />
                          <span>Share Palace Review for #{targetOrder.id}</span>
                        </button>
                      </div>
                    );
                  }

                  // All completed orders are rated
                  return (
                    <div className="bg-emerald-500/5 rounded-3xl border border-emerald-100 p-4 mt-2 flex items-center gap-3 relative overflow-hidden">
                      <div className="bg-emerald-500 text-white rounded-xl p-2 shrink-0">
                        <ThumbsUp size={14} />
                      </div>
                      <div className="flex flex-col gap-0.5 leading-tight">
                        <h4 className="text-xs font-black text-gray-800">Review Submissions Saved!</h4>
                        <p className="text-[9px] text-gray-400 font-bold">
                          Thank you! Your ratings optimize kitchen delivery & food quality rankings.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
