import { useState, useEffect } from "react";
import { FoodOrder, TableBooking } from "../types";

export function useOfflineSync(
  orders: FoodOrder[],
  setOrders: React.Dispatch<React.SetStateAction<FoodOrder[]>>,
  bookings: TableBooking[],
  setBookings: React.Dispatch<React.SetStateAction<TableBooking[]>>
) {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    const saved = localStorage.getItem("rsl_simulated_offline");
    return saved === "true" || (typeof navigator !== "undefined" && !navigator.onLine);
  });
  const [showSyncToast, setShowSyncToast] = useState<boolean>(false);
  const [lastSyncCount, setLastSyncCount] = useState<number>(0);

  // Synchronous network state listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Persist offline simulated preference
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

      if (syncOrdersNeeded) setOrders(updatedOrders);
      if (syncBookingsNeeded) setBookings(updatedBookings);

      const totalSync = orderSyncCount + bookingSyncCount;
      if (totalSync > 0) {
        setLastSyncCount(totalSync);
        setShowSyncToast(true);
        const timer = setTimeout(() => setShowSyncToast(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [isOffline]);

  const toggleOffline = () => setIsOffline(prev => !prev);

  return {
    isOffline,
    showSyncToast,
    lastSyncCount,
    toggleOffline
  };
}
