import React, { useState, useEffect } from "react";
import { Restaurant, MenuItem, TableBooking, FoodOrder, UserLoyalty, Review, LoyaltyReward, Screen } from "./types";
import { 
  initialRestaurants, 
  initialMenuItems, 
  initialReviews, 
  initialLoyalty, 
  loyaltyRewards 
} from "./data";
import MobileSimulator from "./components/MobileSimulator";
import DiscoverScreen from "./components/DiscoverScreen";
import RestaurantMenuScreen from "./components/RestaurantMenuScreen";
import CartScreen from "./components/CartScreen";
import LoyaltyScreen from "./components/LoyaltyScreen";
import BookingScreen from "./components/BookingScreen";
import OrderScreens from "./components/OrderScreens";
import OwnerDashboard from "./components/OwnerDashboard";
import FeedbackScreen from "./components/FeedbackScreen";
import AISommelier from "./components/AISommelier";

export default function App() {
  // --- Persistent Local Database State ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("rsl_restaurants");
    let loaded = saved ? JSON.parse(saved) : initialRestaurants;
    // Auto-migrate the Saffron Taj image URL if it targets the old or broken Unsplash photo
    loaded = loaded.map((r: Restaurant) => {
      const initial = initialRestaurants.find(init => init.id === r.id);
      if (initial) {
        r.cuisine = initial.cuisine;
      }
      if (r.id === 1 && (r.imageUrl.includes("photo-1585938338996-26aa3149fc9a") || !r.imageUrl)) {
        return {
          ...r,
          imageUrl: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&q=80&w=800"
        };
      }
      return r;
    });
    return loaded;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem("rsl_menu_items");
    if (!saved) return initialMenuItems;
    try {
      const parsed: MenuItem[] = JSON.parse(saved);
      return parsed.map((item) => {
        const initial = initialMenuItems.find(i => i.id === item.id);
        if (initial && initial.imageUrl) {
          return { ...item, imageUrl: initial.imageUrl };
        }
        return item;
      });
    } catch (e) {
      return initialMenuItems;
    }
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem("rsl_reviews");
    if (!saved) return initialReviews;
    try {
      const parsed: Review[] = JSON.parse(saved);
      const parsedIds = new Set(parsed.map((r) => r.id));
      const missingReviews = initialReviews.filter((r) => !parsedIds.has(r.id));
      if (missingReviews.length > 0) {
        return [...parsed, ...missingReviews];
      }
      return parsed;
    } catch (e) {
      return initialReviews;
    }
  });

  const [bookings, setBookings] = useState<TableBooking[]>(() => {
    const saved = localStorage.getItem("rsl_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<FoodOrder[]>(() => {
    const saved = localStorage.getItem("rsl_orders");
    return saved ? JSON.parse(saved) : [];
  });

  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty>(() => {
    const saved = localStorage.getItem("rsl_loyalty");
    return saved ? JSON.parse(saved) : initialLoyalty;
  });

  // --- Session Ephemeral State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: "Discover" });
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([{ type: "Discover" }]);
  const [cart, setCart] = useState<{ [itemId: number]: number }>({});
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);
  const [role, setRole] = useState<"customer" | "owner">("customer");

  // --- Network Connection & Offline Caching State ---
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    const saved = localStorage.getItem("rsl_simulated_offline");
    return saved === "true" || (typeof navigator !== "undefined" && !navigator.onLine);
  });
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [lastSyncCount, setLastSyncCount] = useState<number>(0);

  // Synchronous network state listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
    };
    const handleOffline = () => {
      setIsOffline(true);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync to local storage simulated offline preference
  useEffect(() => {
    localStorage.setItem("rsl_simulated_offline", String(isOffline));
  }, [isOffline]);

  // Handle Automatic Background Sync when network returns
  useEffect(() => {
    if (!isOffline) {
      let syncOrdersNeeded = false;
      let syncBookingsNeeded = false;
      let orderSyncCount = 0;
      let bookingSyncCount = 0;

      const updatedOrders = orders.map(o => {
        if (o.isOfflinePending) {
          syncOrdersNeeded = true;
          orderSyncCount++;
          return { ...o, isOfflinePending: false };
        }
        return o;
      });

      const updatedBookings = bookings.map(b => {
        if (b.isOfflinePending) {
          syncBookingsNeeded = true;
          bookingSyncCount++;
          return { ...b, isOfflinePending: false };
        }
        return b;
      });

      if (syncOrdersNeeded) {
        setOrders(updatedOrders);
      }
      if (syncBookingsNeeded) {
        setBookings(updatedBookings);
      }

      const totalSync = orderSyncCount + bookingSyncCount;
      if (totalSync > 0) {
        setLastSyncCount(totalSync);
        setShowSyncToast(true);
        const timer = setTimeout(() => setShowSyncToast(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOffline]);

  // Sync to Local Storage on updates
  useEffect(() => {
    localStorage.setItem("rsl_restaurants", JSON.stringify(restaurants));
  }, [restaurants]);

  useEffect(() => {
    localStorage.setItem("rsl_menu_items", JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem("rsl_reviews", JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem("rsl_bookings", JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem("rsl_orders", JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem("rsl_loyalty", JSON.stringify(userLoyalty));
  }, [userLoyalty]);

  // --- Navigation Core Handlers ---
  const handleNavigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
    setNavigationHistory(pref => [...pref, screen]);
  };

  const handleNavigateBack = () => {
    if (navigationHistory.length > 1) {
      const poppedHistory = navigationHistory.slice(0, -1);
      setNavigationHistory(poppedHistory);
      setCurrentScreen(poppedHistory[poppedHistory.length - 1]);
    } else {
      // Default fallback
      const rootScreen: Screen = { type: "Discover" };
      setCurrentScreen(rootScreen);
      setNavigationHistory([rootScreen]);
    }
  };

  // --- Cart Core Rules Handler ---
  // Returns restaurant representing items currently inside the cart
  const getCartRestaurant = (): Restaurant | null => {
    const itemIds = Object.keys(cart).map(id => parseInt(id)).filter(id => cart[id] > 0);
    if (itemIds.length === 0) return null;
    const firstDishId = itemIds[0];
    const firstDish = menuItems.find(m => m.id === firstDishId);
    if (!firstDish) return null;
    return restaurants.find(r => r.id === firstDish.restaurantId) || null;
  };

  const handleAddToCart = (item: MenuItem) => {
    const cartRest = getCartRestaurant();
    
    // Zomato/Swiggy constraint validation: Check co-restaurants
    if (cartRest !== null && cartRest.id !== item.restaurantId) {
      const confirmReset = window.confirm(
        `Your cart already contains dishes from "${cartRest.name}". Discard those dishes and start a new order from "${
          restaurants.find(r => r.id === item.restaurantId)?.name || "this spot"
        }"?`
      );
      if (!confirmReset) return;
      
      // Reset cart and start fresh with new item item
      setCart({ [item.id]: 1 });
      setSelectedReward(null);
      return;
    }

    setCart(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1
    }));
  };

  const handleRemoveFromCart = (item: MenuItem) => {
    setCart(prev => {
      const updated = { ...prev };
      if (!updated[item.id]) return prev;
      updated[item.id] -= 1;
      if (updated[item.id] <= 0) {
        delete updated[item.id];
      }
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart({});
    setSelectedReward(null);
  };

  const handleClearReward = () => {
    setSelectedReward(null);
  };

  const handleSelectReward = (reward: LoyaltyReward): boolean => {
    if (userLoyalty.pointsBalance >= reward.pointsCost) {
      setSelectedReward(reward);
      return true;
    }
    return false;
  };

  // --- Reservation Booking Handler ---
  const handleMakeBooking = (
    restaurantId: number,
    restaurantName: string,
    guestName: string,
    guestPhone: string,
    date: string,
    time: string,
    numGuests: number,
    seatingArea: string,
    specialRequest: string
  ) => {
    const newBooking: TableBooking = {
      id: Math.floor(Math.random() * 9000) + 1000,
      restaurantId,
      restaurantName,
      guestName,
      guestPhone,
      date,
      time,
      numGuests,
      seatingArea,
      specialRequest,
      status: "Confirmed",
      timestamp: Date.now(),
      isOfflinePending: isOffline ? true : undefined
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: number) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "Cancelled" as const } : b)
    );
  };

  // --- Checkout Order Placed Handler ---
  const handlePlaceOrder = (address: string) => {
    const cartRest = getCartRestaurant();
    if (!cartRest) return;

    // Resolve cart item entries
    const itemsList = Object.entries(cart)
      .map(([id, qty]) => {
        const item = menuItems.find(m => m.id === parseInt(id));
        return item ? { menuItem: item, quantity: qty } : null;
      })
      .filter((entry): entry is { menuItem: MenuItem; quantity: number } => entry !== null);

    const subtotal = itemsList.reduce((acc, curr) => acc + (curr.menuItem.price * curr.quantity), 0);
    const gstAndTaxes = Math.round((subtotal * 0.18) * 100) / 100;
    const deliveryFee = 40.0;
    const discount = selectedReward ? selectedReward.discountAmount : 0.0;
    const grandTotal = Math.max(0, subtotal + gstAndTaxes + deliveryFee - discount);
    
    // 1 points earned per ₹10 of subtotal spent (as defined in source project)
    const pointsEarned = Math.floor(subtotal / 10);
    const costSpendPoints = selectedReward ? selectedReward.pointsCost : 0;

    const itemsSummaryString = itemsList
      .map(entry => `${entry.menuItem.name} x${entry.quantity}`)
      .join(", ");

    const newOrderId = Math.floor(Math.random() * 90000) + 10000;
    const newOrder: FoodOrder = {
      id: newOrderId,
      restaurantId: cartRest.id,
      restaurantName: cartRest.name,
      itemsSummary: itemsSummaryString,
      items: itemsList,
      subtotal,
      gstAndTaxes,
      deliveryFee,
      total: grandTotal,
      status: "Placed",
      timestamp: Date.now(),
      pointsEarned,
      isOfflinePending: isOffline ? true : undefined
    };

    // Commit order
    setOrders(prev => [newOrder, ...prev]);

    // Adjust Loyalty Points Balance & Tier Status
    setUserLoyalty(prev => {
      const nextBalance = prev.pointsBalance - costSpendPoints + pointsEarned;
      const nextCareerTotal = prev.pointsEarnedTotal + pointsEarned;
      
      // Determine next tier status
      let nextTier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
      if (nextCareerTotal >= 1500) nextTier = "Platinum";
      else if (nextCareerTotal >= 800) nextTier = "Gold";
      else if (nextCareerTotal >= 300) nextTier = "Silver";

      return {
        ...prev,
        pointsBalance: nextBalance,
        pointsEarnedTotal: nextCareerTotal,
        tier: nextTier
      };
    });

    // Reset checkout states
    setCart({});
    setSelectedReward(null);

    // Open tracking view immediately
    handleNavigateTo({ type: "OrderTracking", orderId: newOrderId });
  };

  // --- Owner Custom Tools Core Handlers ---
  const handleToggleSpecialOption = (itemId: number, isSpecial: boolean) => {
    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, isSpecial } : m)
    );
  };

  const handleUpdatePriceOption = (itemId: number, newPrice: number) => {
    setMenuItems(prev => 
      prev.map(m => m.id === itemId ? { ...m, price: newPrice } : m)
    );
  };

  const handleAddReview = (
    restaurantId: number,
    menuItemId: number | null,
    menuItemName: string | null,
    userName: string,
    rating: number,
    comment: string
  ) => {
    const newReviewId = reviews.length + 1;
    const newReview: Review = {
      id: newReviewId,
      restaurantId,
      menuItemId,
      menuItemName,
      userName,
      comment,
      rating,
      timestamp: Date.now()
    };

    // Prepend to active review feed
    const nextReviews = [newReview, ...reviews];
    setReviews(nextReviews);

    // Dynamic Recalculation: Adjust active restaurant rating based on review weights
    const targetRestReviews = nextReviews.filter(rev => rev.restaurantId === restaurantId);
    const avgRating = targetRestReviews.reduce((sum, r) => sum + r.rating, 0) / targetRestReviews.length;
    const roundedAvg = Math.round(avgRating * 10) / 10;

    setRestaurants(prev => 
      prev.map(r => r.id === restaurantId 
        ? { ...r, rating: roundedAvg, reviewCount: targetRestReviews.length } 
        : r
      )
    );
  };

  // Dynamic filter for signature chef recommend highlights
  const signatureChefSpecials = menuItems.filter(item => item.isSpecial);

  // Resolution Cart Count
  const cartBadgeCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  return (
    <MobileSimulator
      currentScreen={currentScreen}
      onNavigate={handleNavigateTo}
      cartCount={cartBadgeCount}
      points={userLoyalty.pointsBalance}
      tier={userLoyalty.tier}
      role={role}
      setRole={setRole}
      isOffline={isOffline}
      onToggleOffline={() => setIsOffline(prev => !prev)}
      showSyncToast={showSyncToast}
      lastSyncCount={lastSyncCount}
    >
      {/* Route Switch dispatcher render */}
      {(() => {
        switch (currentScreen.type) {
          case "Discover":
            return (
              <DiscoverScreen
                restaurants={restaurants}
                specials={signatureChefSpecials}
                reviews={reviews}
                onSelectRestaurant={(rest) => handleNavigateTo({ type: "RestaurantMenu", restaurant: rest })}
                onNavigateTo={handleNavigateTo}
              />
            );
          case "RestaurantMenu":
            return (
              <RestaurantMenuScreen
                restaurant={currentScreen.restaurant}
                menuItems={menuItems.filter(m => m.restaurantId === currentScreen.restaurant.id)}
                cart={cart}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onNavigateTo={handleNavigateTo}
                onNavigateBack={handleNavigateBack}
                reviews={reviews.filter(rev => rev.restaurantId === currentScreen.restaurant.id)}
                onAddReview={handleAddReview}
                initialCategory={"initialCategory" in currentScreen ? currentScreen.initialCategory : undefined}
                highlightItemId={"highlightItemId" in currentScreen ? currentScreen.highlightItemId : undefined}
              />
            );
          case "TableBookingScreen":
            return (
              <BookingScreen
                bookings={bookings}
                restaurants={restaurants}
                selectedRestaurant={currentScreen.restaurant}
                onMakeBooking={handleMakeBooking}
                onCancelBooking={handleCancelBooking}
                onNavigateTo={handleNavigateTo}
              />
            );
          case "BookingsList":
            return (
              <BookingScreen
                bookings={bookings}
                restaurants={restaurants}
                selectedRestaurant={null}
                onMakeBooking={handleMakeBooking}
                onCancelBooking={handleCancelBooking}
                onNavigateTo={handleNavigateTo}
              />
            );
          case "Cart":
            return (
              <CartScreen
                cart={cart}
                menuItems={menuItems}
                restaurants={restaurants}
                selectedRestaurant={getCartRestaurant()}
                selectedReward={selectedReward}
                onClearReward={handleClearReward}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={handleRemoveFromCart}
                onClearCart={handleClearCart}
                onPlaceOrder={handlePlaceOrder}
                onNavigateTo={handleNavigateTo}
              />
            );
          case "LoyaltyDashboard":
            return (
              <LoyaltyScreen
                userLoyalty={userLoyalty}
                rewardsList={loyaltyRewards}
                selectedReward={selectedReward}
                onSelectReward={handleSelectReward}
              />
            );
          case "OrdersList":
          case "OrderTracking":
            return (
              <OrderScreens
                currentScreen={currentScreen}
                orders={orders}
                restaurants={restaurants}
                onNavigateTo={handleNavigateTo}
                onNavigateBack={handleNavigateBack}
              />
            );
          case "Feedback":
            return (
              <FeedbackScreen
                orderId={currentScreen.orderId}
                orders={orders}
                onAddReview={handleAddReview}
                onNavigateTo={handleNavigateTo}
                onNavigateBack={handleNavigateBack}
              />
            );
          case "AISommelier":
            return (
              <AISommelier
                onNavigateBack={handleNavigateBack}
                onAddToCart={handleAddToCart}
                cart={cart}
              />
            );
          case "OwnerConsole":
            return (
              <OwnerDashboard
                restaurants={restaurants}
                menuItems={menuItems}
                bookings={bookings}
                orders={orders}
                onToggleSpecial={handleToggleSpecialOption}
                onUpdatePrice={handleUpdatePriceOption}
              />
            );
          default:
            return (
              <div className="flex-1 p-6 flex flex-col items-center justify-center font-mono text-center">
                <span>Oops! Screen dispatcher mismatch.</span>
                <button 
                  onClick={() => handleNavigateTo({ type: "Discover" })} 
                  className="mt-4 bg-amber-600 text-white text-xs px-4 py-2 rounded-xl"
                >
                  Return to Imperial Discover
                </button>
              </div>
            );
        }
      })()}
    </MobileSimulator>
  );
}
