import { useState } from "react";
import { MenuItem, Restaurant, LoyaltyReward } from "../types";

export function useCartState(menuItems: MenuItem[], restaurants: Restaurant[]) {
  const [cart, setCart] = useState<{ [itemId: number]: number }>({});
  const [selectedReward, setSelectedReward] = useState<LoyaltyReward | null>(null);

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
    if (cartRest !== null && cartRest.id !== item.restaurantId) {
      const confirmReset = window.confirm(
        `Your cart already contains dishes from "${cartRest.name}". Discard those dishes and start a new order from "${
          restaurants.find(r => r.id === item.restaurantId)?.name || "this spot"
        }"?`
      );
      if (!confirmReset) return;
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

  const handleClearReward = () => setSelectedReward(null);

  const handleSelectReward = (reward: LoyaltyReward, pointsBalance: number): boolean => {
    if (pointsBalance >= reward.pointsCost) {
      setSelectedReward(reward);
      return true;
    }
    return false;
  };

  const cartBadgeCount = (Object.values(cart) as number[]).reduce((a, b) => a + b, 0);

  return {
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
  };
}
