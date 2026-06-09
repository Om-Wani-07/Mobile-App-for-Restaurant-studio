import React, { useState } from "react";
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Clock, 
  Coffee, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  MenuSquare,
  Sparkles,
  RefreshCcw,
  User,
  Phone
} from "lucide-react";
import { TableBooking, Restaurant, Screen } from "../types";

interface BookingScreenProps {
  bookings: TableBooking[];
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onMakeBooking: (
    restaurantId: number,
    restaurantName: string,
    guestName: string,
    guestPhone: string,
    date: string,
    time: string,
    numGuests: number,
    seatingArea: string,
    specialRequest: string
  ) => void;
  onCancelBooking: (bookingId: number) => void;
  onNavigateTo: (screen: Screen) => void;
}

export default function BookingScreen({
  bookings,
  restaurants,
  selectedRestaurant,
  onMakeBooking,
  onCancelBooking,
  onNavigateTo
}: BookingScreenProps) {
  const [activeTab, setActiveTab] = useState<"book" | "history">("book");
  
  // --- Calendar Integration Simulator States ---
  const [isSyncingId, setIsSyncingId] = useState<number | null>(null);
  const [syncedIds, setSyncedIds] = useState<number[]>([]);
  const [showToast, setShowToast] = useState<string | null>(null);

  const downloadIcsFile = (booking: TableBooking) => {
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const now = new Date();
    const dateStr = booking.date.replace(/-/g, '');
    const timeStr = booking.time.replace(/:/g, '') + '00';
    
    const datestamp = [
      now.getUTCFullYear(),
      pad(now.getUTCMonth() + 1),
      pad(now.getUTCDate()),
      'T',
      pad(now.getUTCHours()),
      pad(now.getUTCMinutes()),
      pad(now.getUTCSeconds()),
      'Z'
    ].join('');

    const icsLines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Saffron Taj//Table Reservation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:booking-${booking.id}@saffrontaj.com`,
      `DTSTAMP:${datestamp}`,
      `DTSTART;TZID=Asia/Kolkata:${dateStr}T${timeStr}`,
      `DURATION:PT2H`,
      `SUMMARY:Table Reservation - ${booking.restaurantName}`,
      `DESCRIPTION:Royal Table Booking Ref: #B-${booking.id}\\nGuest: ${booking.guestName}\\nGuests Count: ${booking.numGuests}\\nSeating: ${booking.seatingArea}${booking.specialRequest ? `\\nSpecial Requests: ${booking.specialRequest}` : ''}`,
      `LOCATION:${booking.restaurantName}, New Delhi`,
      "STATUS:CONFIRMED",
      "END:VEVENT",
      "END:VCALENDAR"
    ];

    const blob = new Blob([icsLines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `reservation_${booking.id}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAddToCalendar = (b: TableBooking) => {
    setIsSyncingId(b.id);
    
    setTimeout(() => {
      setIsSyncingId(null);
      setSyncedIds(prev => [...prev, b.id]);
      setShowToast(`Success! Reservation at ${b.restaurantName} added to device calendar.`);
      
      try {
        downloadIcsFile(b);
      } catch (err) {
        console.error("Failed to download ICS file", err);
      }
      
      setTimeout(() => {
        setShowToast(null);
      }, 3500);
    }, 1200);
  };

  // Choose default preselected restaurant
  const [bookingRestId, setBookingRestId] = useState(
    selectedRestaurant ? selectedRestaurant.id : restaurants[0]?.id || 1
  );

  // Form Fields
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("+91 98765 43210");
  const [guestsCount, setGuestsCount] = useState(2);
  const [bookingDate, setBookingDate] = useState("2026-05-30");
  const [bookingTime, setBookingTime] = useState("19:30");
  const [seatingArea, setSeatingArea] = useState("Sunlight Terrace");
  const [specialRequest, setSpecialRequest] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  const activeBookingRest = restaurants.find(r => r.id === bookingRestId);

  const seatingAreas = [
    "Indoor Salon", 
    "Sunlight Terrace", 
    "Private Lounge", 
    "Garden View"
  ];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestPhone.trim() || !activeBookingRest) return;

    onMakeBooking(
      activeBookingRest.id,
      activeBookingRest.name,
      guestName.trim(),
      guestPhone.trim(),
      bookingDate,
      bookingTime,
      guestsCount,
      seatingArea,
      specialRequest.trim()
    );

    setFormSuccess(true);
    setGuestName("");
    setSpecialRequest("");
    
    // Auto switch to history to view booked tables after short pause
    setTimeout(() => {
      setFormSuccess(false);
      setActiveTab("history");
    }, 1500);
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 select-none relative">
      {/* Dynamic Toast Feedback Overlay */}
      {showToast && (
        <div className="absolute top-12 left-4 right-4 z-50 bg-slate-900/95 backdrop-blur-xs text-white border border-slate-800 rounded-2xl p-3.5 shadow-xl flex items-center gap-2.5 text-[10px] font-semibold leading-relaxed">
          <div className="bg-emerald-500 rounded-full p-1 text-white shrink-0 flex items-center justify-center">
            <CheckCircle2 size={12} className="stroke-[3px]" />
          </div>
          <span className="flex-1">{showToast}</span>
        </div>
      )}

      {/* Tab selection controls */}
      <div className="bg-white border-b border-gray-100 flex p-1 shrink-0 z-30">
        <button
          id="book-tab-btn"
          onClick={() => setActiveTab("book")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "book"
              ? "border-amber-600 text-amber-700 bg-amber-50/10"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <CalendarDays size={13} />
          <span>New Booking</span>
        </button>
        <button
          id="history-tab-btn"
          onClick={() => setActiveTab("history")}
          className={`flex-1 py-3 text-xs font-bold text-center border-b-2 flex items-center justify-center gap-1.5 transition-all ${
            activeTab === "history"
              ? "border-amber-600 text-amber-700 bg-amber-50/10"
              : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          <MenuSquare size={13} />
          <span>Active Bookings ({bookings.length})</span>
        </button>
      </div>

      {activeTab === "book" ? (
        /* Form display */
        <form onSubmit={handleBookingSubmit} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [scrollbar-width:none]">
          <div className="flex flex-col gap-1 select-none">
            <h2 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
              Reserve a Royal Table
            </h2>
            <p className="text-[10px] text-gray-500">
              Arrange seamless layouts and custom special decorations
            </p>
          </div>

          {formSuccess && (
            <div className="bg-emerald-50 text-emerald-800 text-[10px] font-bold p-3.5 rounded-2xl border border-emerald-150 flex items-center gap-1.5 shadow-3xs animate-scale-in">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Table Reserved! Redirecting to reservation logs...</span>
            </div>
          )}

          {/* Restaurant Selector dropdown if multiple available */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-gray-400">Choose Culinary Spot</label>
            <select
              id="booking-restaurant-select"
              value={bookingRestId}
              onChange={(e) => setBookingRestId(parseInt(e.target.value))}
              className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
            >
              {restaurants.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.cuisine.split("•")[0].trim()})
                </option>
              ))}
            </select>
          </div>

          {activeBookingRest && (
            <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-3xs flex items-center gap-3">
              <img 
                src={activeBookingRest.imageUrl} 
                alt={activeBookingRest.name}
                referrerPolicy="no-referrer"
                className="h-10 w-10 object-cover rounded-xl shrink-0" 
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-800 leading-tight">
                  {activeBookingRest.name}
                </span>
                <span className="text-[9px] text-gray-400 font-medium">
                  {activeBookingRest.address.split(",")[0]}
                </span>
              </div>
            </div>
          )}

          {/* Guest coordinates */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <User size={10} className="text-slate-400" />
                <span>Guest Name</span>
              </label>
              <input 
                id="booking-name-input"
                type="text"
                required
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Rahul Sharma"
                className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Phone size={10} className="text-slate-400" />
                <span>Phone number</span>
              </label>
              <input 
                id="booking-phone-input"
                type="text"
                required
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Seating & guest count */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Users size={10} className="text-slate-400" />
                <span>Guests Count</span>
              </label>
              <div className="bg-white border border-gray-150 rounded-xl p-1 flex justify-between items-center text-xs font-bold text-gray-800">
                <button
                  type="button"
                  onClick={() => setGuestsCount(Math.max(1, guestsCount - 1))}
                  className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg active:scale-90 transition-all font-mono"
                >
                  -
                </button>
                <span>{guestsCount} Guests</span>
                <button
                  type="button"
                  onClick={() => setGuestsCount(Math.min(10, guestsCount + 1))}
                  className="bg-slate-50 hover:bg-slate-100 p-1.5 rounded-lg active:scale-90 transition-all font-mono"
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Coffee size={10} className="text-slate-400" />
                <span>Seating Area</span>
              </label>
              <select
                id="booking-seating-select"
                value={seatingArea}
                onChange={(e) => setSeatingArea(e.target.value)}
                className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1 focus:ring-amber-500/50"
              >
                {seatingAreas.map(area => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Time Picker slots */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <CalendarDays size={10} className="text-slate-400" />
                <span>Date</span>
              </label>
              <input 
                id="booking-date-input"
                type="date"
                required
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase font-bold text-gray-400 flex items-center gap-1">
                <Clock size={10} className="text-slate-400" />
                <span>Time Slot</span>
              </label>
              <input 
                id="booking-time-input"
                type="time"
                required
                value={bookingTime}
                onChange={(e) => setBookingTime(e.target.value)}
                className="bg-white border border-gray-150 rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] uppercase font-bold text-gray-400">Special Requests / Occasion</label>
            <textarea 
              id="booking-requests-input"
              value={specialRequest}
              onChange={(e) => setSpecialRequest(e.target.value)}
              placeholder="e.g. Birthday anniversary decoration, silent window corner table, eggless chocolate cake..."
              rows={2}
              className="bg-white border border-gray-150 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-hidden focus:ring-1"
            />
          </div>

          {/* Submit btn */}
          <button
            id="submit-booking-action-btn"
            type="submit"
            className="w-full bg-amber-600 border border-amber-500 text-white font-bold text-xs py-3.5 rounded-2xl flex items-center justify-center gap-1 shadow-md hover:bg-amber-700 active:scale-95 transition-all cursor-pointer mt-2"
          >
            <span>Confirm Royal Table Block</span>
          </button>
        </form>
      ) : (
        /* History lists display */
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 [scrollbar-width:none]">
          <div className="flex flex-col gap-1 select-none">
            <h2 className="text-xs uppercase font-extrabold text-gray-400 font-mono tracking-wider">
              My Table Reservatios
            </h2>
            <p className="text-[10px] text-gray-500">
              Confirms and logs of imperial banquet allocations
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-2">
              <CalendarDays size={32} className="text-gray-300 stroke-1" />
              <span className="text-xs font-bold text-gray-600">No table bookings found</span>
              <span className="text-[10px] text-gray-400">Try reserving a luxury table at Saffron Taj!</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {bookings.map(b => {
                const restObj = restaurants.find(r => r.id === b.restaurantId);
                const isConfirmed = b.status === "Confirmed";
                
                return (
                  <div 
                    key={b.id} 
                    className="bg-white rounded-3xl border border-gray-100 p-4 shadow-3xs flex flex-col gap-3 transition-all hover:border-amber-100"
                  >
                    {/* Header: spot details & badge */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-800 leading-tight">
                          {b.restaurantName}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">
                          ID: #B-{b.id}
                        </span>
                      </div>

                      {/* Status pill badge */}
                      {b.isOfflinePending ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 animate-pulse font-mono flex items-center gap-0.5 shrink-0">
                          <span>📶 Offline Draft</span>
                        </span>
                      ) : (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-0.5 border ${
                          isConfirmed
                            ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                            : "bg-rose-50 border-rose-100 text-rose-700"
                        }`}>
                          {isConfirmed ? (
                            <>
                              <CheckCircle2 size={10} className="text-emerald-700" />
                              <span>Confirmed</span>
                            </>
                          ) : (
                            <>
                              <XCircle size={10} className="text-rose-700" />
                              <span>Cancelled</span>
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-bold py-2 border-y border-gray-50">
                      <div className="flex items-center gap-1">
                        <CalendarDays size={11} className="text-slate-400" />
                        <span>{b.date}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} className="text-slate-400" />
                        <span>{b.time}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users size={11} className="text-slate-400" />
                        <span>{b.numGuests} Guests</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Coffee size={11} className="text-slate-400" />
                        <span>{b.seatingArea}</span>
                      </div>
                    </div>

                    {/* Guest reference details */}
                    <div className="flex flex-col gap-0.5 text-[9px] text-gray-400">
                      <span><strong>Guest:</strong> {b.guestName} ({b.guestPhone})</span>
                      {b.specialRequest && (
                        <span><strong>Requests:</strong> &ldquo;{b.specialRequest}&rdquo;</span>
                      )}
                    </div>

                    {/* Actions if confirmed */}
                    {isConfirmed && (
                      <div className="flex flex-col gap-2">
                        {/* Dynamic Add to Device Calendar Simulator Button */}
                        <button
                          id={`add-calendar-btn-${b.id}`}
                          type="button"
                          onClick={() => handleAddToCalendar(b)}
                          disabled={isSyncingId !== null}
                          className={`w-full text-center text-[10px] font-bold py-2.5 px-3 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                            syncedIds.includes(b.id)
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700 font-extrabold cursor-default"
                              : isSyncingId === b.id
                              ? "bg-amber-50 border-amber-100 text-amber-700 font-extrabold animate-pulse"
                              : "bg-amber-600 border-amber-500 hover:bg-amber-700 text-white shadow-3xs active:scale-95"
                          }`}
                        >
                          {isSyncingId === b.id ? (
                            <>
                              <RefreshCcw size={11} className="animate-spin text-amber-600 shrink-0" />
                              <span>Syncing with device calendar...</span>
                            </>
                          ) : syncedIds.includes(b.id) ? (
                            <>
                              <CheckCircle2 size={11} className="text-emerald-600 shrink-0" />
                              <span>✓ Added to Calendar (.ICS Generated)</span>
                            </>
                          ) : (
                            <>
                              <CalendarDays size={11} className="text-amber-100 shrink-0" />
                              <span>Add to Calendar (ICS Sync)</span>
                            </>
                          )}
                        </button>

                        <button
                          id={`cancel-booking-btn-${b.id}`}
                          onClick={() => onCancelBooking(b.id)}
                          className="bg-slate-50 hover:bg-rose-50 hover:text-rose-700 text-center text-[10px] font-extrabold text-gray-500 py-2 rounded-xl border border-gray-100 hover:border-rose-100 transition-all cursor-pointer active:scale-95"
                        >
                          Cancel Reservation
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
