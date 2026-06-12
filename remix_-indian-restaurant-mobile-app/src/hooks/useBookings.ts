import { useState, useEffect } from "react";
import { TableBooking } from "../types";

export function useBookings(isOffline?: boolean) {
  const [bookings, setBookings] = useState<TableBooking[]>(() => {
    const saved = localStorage.getItem("rsl_bookings");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("rsl_bookings", JSON.stringify(bookings));
  }, [bookings]);

  // Sync from other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "rsl_bookings" && e.newValue) {
        try {
          setBookings(JSON.parse(e.newValue));
        } catch (err) {
          console.warn("Storage sync failed for bookings:", err);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

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
    const isOffline = localStorage.getItem("rsl_simulated_offline") === "true";
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
      status: "Pending",
      timestamp: Date.now(),
      isOfflinePending: isOffline ? true : undefined
    };
    setBookings(prev => [newBooking, ...prev]);
  };

  const handleCancelBooking = (bookingId: number) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "Cancelled" } : b)
    );
  };

  const handleConfirmBooking = (bookingId: number, tableNumber: string) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status: "Confirmed", tableNumber } : b)
    );
  };

  const handleUpdateBookingStatus = (bookingId: number, status: TableBooking["status"]) => {
    setBookings(prev => 
      prev.map(b => b.id === bookingId ? { ...b, status } : b)
    );
  };

  return {
    bookings,
    setBookings,
    handleMakeBooking,
    handleCancelBooking,
    handleConfirmBooking,
    handleUpdateBookingStatus
  };
}
