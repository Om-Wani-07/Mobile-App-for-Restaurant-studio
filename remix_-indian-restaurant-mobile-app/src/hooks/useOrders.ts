import { useState, useEffect } from "react";
import { FoodOrder } from "../types";

export function useOrders() {
  const [orders, setOrders] = useState<FoodOrder[]>(() => {
    const saved = localStorage.getItem("rsl_orders");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("rsl_orders", JSON.stringify(orders));
  }, [orders]);

  // Sync from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rsl_orders" && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Storage sync failed for orders:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleUpdateOrderStatus = (orderId: number, status: FoodOrder["status"]) => {
    setOrders(prev => 
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
  };

  return {
    orders,
    setOrders,
    handleUpdateOrderStatus
  };
}
