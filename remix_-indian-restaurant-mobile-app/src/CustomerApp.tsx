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
import FeedbackScreen from "./components/FeedbackScreen";
import AISommelier from "./components/AISommelier";
import { useOfflineSync } from "./hooks/useOfflineSync";
import { useBookings } from "./hooks/useBookings";
import { useOrders } from "./hooks/useOrders";
import { useCartState } from "./hooks/useCartState";

export default function CustomerApp() {
  // --- Persistent Local Database State ---
  const [restaurants, setRestaurants] = useState<Restaurant[]>(() => {
    const saved = localStorage.getItem("rsl_restaurants");
    let loaded = saved ? JSON.parse(saved) : initialRestaurants;
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

  const { bookings, setBookings, handleMakeBooking, handleCancelBooking } = useBookings();
  const { orders, setOrders } = useOrders();
  const {
    cart,
    setCart,
    selectedReward,
    setSelectedReward,
    getCartRestaurant,
    handleAddToCart,
    handleRemoveFromCart,
    handleClearCart,
    handleClearReward,
    handleSelectReward,
    cartBadgeCount
  } = useCartState(menuItems, restaurants);

  const [userLoyalty, setUserLoyalty] = useState<UserLoyalty>(() => {
    const saved = localStorage.getItem("rsl_loyalty");
    return saved ? JSON.parse(saved) : initialLoyalty;
  });

  // --- Session Ephemeral State ---
  const [currentScreen, setCurrentScreen] = useState<Screen>({ type: "Discover" });
  const [navigationHistory, setNavigationHistory] = useState<Screen[]>([{ type: "Discover" }]);

  const { isOffline, showSyncToast, lastSyncCount, toggleOffline } = useOfflineSync(
    orders,
    setOrders,
    bookings,
    setBookings
  );

  // Synchronize state changes made in other tabs (e.g. OwnerConsole updates pricing/reviews/bookings/orders)
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
        if (e.key === "rsl_loyalty" && e.newValue) {
          setUserLoyalty(JSON.parse(e.newValue));
        }
      } catch (err) {
        console.warn("Storage sync failed:", err);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
      const rootScreen: Screen = { type: "Discover" };
      setCurrentScreen(rootScreen);
      setNavigationHistory([rootScreen]);
    }
  };

  // --- Checkout Order Placed Handler ---
  const handlePlaceOrder = (address: string) => {
    const cartRest = getCartRestaurant();
    if (!cartRest) return;

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

    setOrders(prev => [newOrder, ...prev]);

    setUserLoyalty(prev => {
      const nextBalance = prev.pointsBalance - costSpendPoints + pointsEarned;
      const nextCareerTotal = prev.pointsEarnedTotal + pointsEarned;
      
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

    setCart({});
    setSelectedReward(null);
    handleNavigateTo({ type: "OrderTracking", orderId: newOrderId });
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

    const nextReviews = [newReview, ...reviews];
    setReviews(nextReviews);

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

  const signatureChefSpecials = menuItems.filter(item => item.isSpecial);

  return (
    <MobileSimulator
      currentScreen={currentScreen}
      onNavigate={handleNavigateTo}
      cartCount={cartBadgeCount}
      points={userLoyalty.pointsBalance}
      tier={userLoyalty.tier}
      isOffline={isOffline}
      onToggleOffline={toggleOffline}
      showSyncToast={showSyncToast}
      lastSyncCount={lastSyncCount}
    >
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
