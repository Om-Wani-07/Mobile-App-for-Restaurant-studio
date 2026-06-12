export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string;
  costForTwo: string;
  address: string;
  imageUrl: string;
}

export interface MenuItem {
  id: number;
  restaurantId: number;
  name: string;
  description: string;
  price: number;
  category: string; // "Starters", "Mains", "Breads", "Biryani", "Desserts"
  isVeg: boolean;
  isPopular: boolean;
  spiceLevel: number; // 1 (Mild), 2 (Medium), 3 (Spicy)
  isSpecial: boolean;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface TableBooking {
  id: number;
  restaurantId: number;
  restaurantName: string;
  guestName: string;
  guestPhone: string;
  date: string;
  time: string;
  numGuests: number;
  seatingArea: string; // "Indoor Salon", "Sunlight Terrace", "Private Lounge", "Garden"
  specialRequest: string;
  status: "Pending" | "Confirmed" | "Cancelled" | "Seated" | "Completed" | "Declined";
  tableNumber?: string;
  timestamp: number;
  isOfflinePending?: boolean;
}

export interface FoodOrder {
  id: number;
  restaurantId: number;
  restaurantName: string;
  itemsSummary: string; // e.g. "Butter Chicken x2, Garlic Naan x3"
  items: Array<{ menuItem: MenuItem; quantity: number }>;
  subtotal: number;
  gstAndTaxes: number;
  deliveryFee: number;
  total: number;
  status: "Placed" | "Preparing" | "Out for Delivery" | "Delivered" | "Cancelled";
  timestamp: number;
  pointsEarned: number;
  isOfflinePending?: boolean;
}

export interface UserLoyalty {
  id: number;
  pointsBalance: number;
  pointsEarnedTotal: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
}

export interface Review {
  id: number;
  restaurantId: number;
  menuItemId?: number | null; // null if restaurant review
  menuItemName?: string | null;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  chefResponse?: string;
  timestamp: number;
}

export interface LoyaltyReward {
  id: string;
  title: string;
  pointsCost: number;
  discountAmount: number;
  description: string;
}

export type Screen =
  | { type: "Discover" }
  | { type: "RestaurantMenu"; restaurant: Restaurant; initialCategory?: string; highlightItemId?: number }
  | { type: "TableBookingScreen"; restaurant: Restaurant }
  | { type: "Cart" }
  | { type: "BookingsList" }
  | { type: "OrdersList" }
  | { type: "OrderTracking"; orderId: number }
  | { type: "Feedback"; orderId: number }
  | { type: "LoyaltyDashboard" }
  | { type: "AISommelier" };
