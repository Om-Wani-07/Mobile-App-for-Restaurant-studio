import React, { useState } from "react";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Ticket, 
  MapPin, 
  ChevronRight, 
  Check, 
  X,
  CreditCard
} from "lucide-react";
import { MenuItem, LoyaltyReward, Restaurant, Screen } from "../types";

interface CartScreenProps {
  cart: { [itemId: number]: number };
  menuItems: MenuItem[];
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  selectedReward: LoyaltyReward | null;
  onClearReward: () => void;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (item: MenuItem) => void;
  onClearCart: () => void;
  onPlaceOrder: (address: string) => void;
  onNavigateTo: (screen: Screen) => void;
}

export default function CartScreen({
  cart,
  menuItems,
  restaurants,
  selectedRestaurant,
  selectedReward,
  onClearReward,
  onAddToCart,
  onRemoveFromCart,
  onClearCart,
  onPlaceOrder,
  onNavigateTo
}: CartScreenProps) {
  const [deliveryAddress, setDeliveryAddress] = useState(
    "Flat 405, Block B, Royal Heights, Indiranagar, Bengaluru"
  );
  const [phone, setPhone] = useState("+91 98765 43210");
  const [paymentMethod, setPaymentMethod] = useState("UPI / GPay");

  const cartItemsList = Object.entries(cart)
    .map(([itemId, qty]) => {
      const item = menuItems.find(m => m.id === parseInt(itemId));
      return { item, quantity: qty };
    })
    .filter((entry): entry is { item: MenuItem; quantity: number } => entry.item !== undefined && entry.quantity > 0);

  // Math Calculations (mirroring the source view model formulas)
  const subtotal = cartItemsList.reduce((acc, current) => acc + (current.item.price * current.quantity), 0);
  const gstAndTaxes = Math.round((subtotal * 0.18) * 100) / 100;
  const deliveryFee = subtotal > 0 ? 40.0 : 0.0;
  const discountAmount = selectedReward ? selectedReward.discountAmount : 0.0;
  const pointsToEarn = Math.floor(subtotal / 10);
  const totalAmount = Math.max(0, subtotal + gstAndTaxes + deliveryFee - discountAmount);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItemsList.length === 0) return;
    onPlaceOrder(deliveryAddress);
  };

  if (cartItemsList.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-8 flex flex-col items-center justify-center text-center gap-4 bg-slate-50 [scrollbar-width:none]">
        <div className="bg-amber-100 p-4 rounded-full text-amber-700 shadow-sm animate-pulse">
          <ShoppingBag size={36} />
        </div>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-display font-bold text-gray-900 border-none outline-none">
            Your Gourmet Bag is Empty
          </h2>
          <p className="text-[10px] text-gray-500 max-w-[200px] leading-relaxed">
            Browse royal dishes from Imperial Delhi, Chettinad Coast, or Amritsar dhabas!
          </p>
        </div>
        <button
          id="browse-spots-cart-btn"
          onClick={() => onNavigateTo({ type: "Discover" })}
          className="bg-amber-600 text-white font-bold text-xs px-4 py-2 rounded-xl border border-amber-500 shadow-sm hover:bg-amber-700 active:scale-95 transition-all"
        >
          Browse Culinary Spots
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 select-none">
      {/* Header bar */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between z-30 shrink-0">
        <h1 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
          Shopping Cart Feast
        </h1>
        <button 
          id="clear-cart-btn"
          onClick={onClearCart}
          className="text-gray-400 hover:text-rose-600 flex items-center gap-1 text-[10px] uppercase font-bold transition-colors"
        >
          <Trash2 size={12} />
          <span>Clear Feast</span>
        </button>
      </div>

      {/* Main Form/Summary Area */}
      <form onSubmit={handleCheckoutSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [scrollbar-width:none]">
        {/* Restaurant Focus Header Banner */}
        {selectedRestaurant && (
          <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-3xs flex items-center gap-3">
            <img 
              src={selectedRestaurant.imageUrl} 
              alt={selectedRestaurant.name}
              referrerPolicy="no-referrer"
              className="h-10 w-10 object-cover rounded-xl shrink-0" 
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-800 leading-tight">
                {selectedRestaurant.name}
              </span>
              <span className="text-[9px] text-amber-700 font-bold uppercase tracking-wider font-mono">
                Order Source spot
              </span>
            </div>
          </div>
        )}

        {/* Cart items listing */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-3xs flex flex-col gap-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Selected Dishes</h3>
          <div className="flex flex-col gap-3 divide-y divide-gray-50">
            {cartItemsList.map(({ item, quantity }) => (
              <div key={item.id} className="flex justify-between items-center pt-2.5 first:pt-0">
                <div className="flex flex-col flex-1 pr-4">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2.5 w-2.5 border flex items-center justify-center p-0.5 rounded-xs ${item.isVeg ? "border-emerald-600" : "border-rose-600"}`}>
                      <div className={`h-1 w-1 rounded-full ${item.isVeg ? "bg-emerald-600" : "bg-rose-600"}`} />
                    </div>
                    <span className="text-xs font-bold text-gray-800 leading-tight">{item.name}</span>
                  </div>
                  <span className="text-[9px] text-gray-400 font-mono mt-0.5">
                    ₹{item.price} each
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-extrabold text-gray-700">
                    ₹{item.price * quantity}
                  </span>
                  
                  {/* +/- Counter */}
                  <div className="bg-slate-50 text-gray-800 text-[10px] font-extrabold rounded-lg py-1 px-1.5 flex items-center gap-2 border border-gray-100">
                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item)}
                      className="hover:bg-gray-200 p-1 rounded-sm active:scale-80 transition-all text-gray-500"
                    >
                      <Minus size={10} className="stroke-[3]" />
                    </button>
                    <span className="font-mono text-center font-bold px-0.5 min-w-4">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddToCart(item)}
                      className="hover:bg-gray-200 p-1 rounded-sm active:scale-80 transition-all text-gray-500"
                    >
                      <Plus size={10} className="stroke-[3]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Loyalty reward coupon voucher block */}
        {selectedReward ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 relative animate-scale-in shadow-xs">
            <Ticket className="text-amber-600 shrink-0" size={18} />
            <div className="flex flex-col flex-1 pr-4">
              <span className="text-xs font-bold text-amber-950">
                {selectedReward.title} Applied!
              </span>
              <p className="text-[10px] text-amber-700 leading-relaxed font-semibold">
                Successfully saved ₹{selectedReward.discountAmount} flat from your career points.
              </p>
            </div>
            <button
              id="clear-reward-btn"
              type="button"
              onClick={onClearReward}
              className="absolute top-3 right-3 text-amber-600 hover:text-amber-800 transition-colors"
              title="Remove promo discount"
            >
              <X size={14} className="stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => onNavigateTo({ type: "LoyaltyDashboard" })}
            className="bg-white border border-dashed border-gray-200 rounded-2xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-amber-50/20 hover:border-amber-200/50 transition-all shadow-3xs group"
          >
            <div className="flex items-center gap-2">
              <Ticket className="text-amber-600 group-hover:scale-110 transition-transform" size={15} />
              <span className="text-xs font-bold text-gray-700">
                Redeem Loyalty Points Discount
              </span>
            </div>
            <ChevronRight size={14} className="text-gray-400" />
          </div>
        )}

        {/* Delivery Coordinates Forms */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-3xs flex flex-col gap-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
            <MapPin size={11} className="text-slate-400" />
            <span>Delivery Coordinates</span>
          </h3>

          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400">Delivery Address</label>
              <input 
                id="cart-address-input"
                type="text"
                required
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Where to deliver?"
                className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[9px] uppercase font-bold text-gray-400">Mobile Phone</label>
              <input 
                id="cart-phone-input"
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone call verification"
                className="bg-slate-50 border border-gray-100 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>
        </div>

        {/* Premium Bill Summary */}
        <div className="bg-white rounded-3xl border border-gray-100 p-4 shadow-3xs flex flex-col gap-3">
          <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
            <CreditCard size={11} className="text-slate-400" />
            <span>Detailed Bill Summary</span>
          </h3>
          
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between items-center text-gray-600">
              <span>Item Total</span>
              <span className="font-mono">₹{subtotal}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>GST & Restaurant Taxes (18%)</span>
              <span className="font-mono">₹{gstAndTaxes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600">
              <span>Delivery Partner Trust Fee</span>
              <span className="font-mono">₹{deliveryFee}</span>
            </div>

            {selectedReward && (
              <div className="flex justify-between items-center text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                <span>Loyalty Voucher Promo</span>
                <span className="font-mono">-₹{discountAmount}</span>
              </div>
            )}

            <div className="pt-2.5 border-t border-gray-100 flex justify-between items-center text-gray-900 font-extrabold text-sm font-display select-none">
              <span>Grand Total</span>
              <span className="font-mono text-amber-700">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Reward Points to Earn notice */}
          {pointsToEarn > 0 && (
            <div className="mt-2 bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold">
              <span className="bg-emerald-600 text-white rounded-full h-4 w-4 flex items-center justify-center font-bold text-[8px]">
                +
              </span>
              <span>Earn +{pointsToEarn} points on this Royal Feast!</span>
            </div>
          )}
        </div>

        {/* Place Order checkout submit CTA */}
        <div className="mb-8">
          <button
            id="checkout-order-btn"
            type="submit"
            className="w-full bg-emerald-600 text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1 border border-emerald-500 shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <span>Place Order • ₹{totalAmount.toFixed(2)}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
