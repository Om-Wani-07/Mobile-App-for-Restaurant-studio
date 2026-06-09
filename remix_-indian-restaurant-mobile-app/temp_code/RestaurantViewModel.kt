package com.example.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.data.*
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

sealed interface Screen {
    object Discover : Screen
    data class RestaurantMenu(val restaurant: Restaurant) : Screen
    data class TableBookingScreen(val restaurant: Restaurant) : Screen
    object Cart : Screen
    object BookingsList : Screen
    object OrdersList : Screen
    data class OrderTracking(val orderId: Int) : Screen
    object LoyaltyDashboard : Screen
    object OwnerConsole : Screen
}

data class LoyaltyReward(
    val id: String,
    val title: String,
    val pointsCost: Int,
    val discountAmount: Double,
    val description: String
)

class RestaurantViewModel(application: Application) : AndroidViewModel(application) {

    private val repository: RestaurantRepository

    init {
        val database = AppDatabase.getDatabase(application)
        repository = RestaurantRepository(database.restaurantDao())
        
        // Pre-populate database with gourmet Indian restaurant data
        viewModelScope.launch {
            repository.initializeDatabaseIfEmpty()
        }
    }

    // Navigation State
    private val _currentScreen = MutableStateFlow<Screen>(Screen.Discover)
    val currentScreen: StateFlow<Screen> = _currentScreen.asStateFlow()

    fun navigateTo(screen: Screen) {
        _currentScreen.value = screen
    }

    // Backstack simulation
    private val navigationHistory = mutableListOf<Screen>()

    fun navigateWithHistory(screen: Screen) {
        navigationHistory.add(_currentScreen.value)
        _currentScreen.value = screen
    }

    fun goBack() {
        if (navigationHistory.isNotEmpty()) {
            _currentScreen.value = navigationHistory.removeAt(navigationHistory.size - 1)
        } else {
            _currentScreen.value = Screen.Discover
        }
    }

    // Restaurants
    val restaurants: StateFlow<List<Restaurant>> = repository.allRestaurants
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    private val _selectedRestaurant = MutableStateFlow<Restaurant?>(null)
    val selectedRestaurant: StateFlow<Restaurant?> = _selectedRestaurant.asStateFlow()

    fun selectRestaurant(restaurant: Restaurant) {
        if (_selectedRestaurant.value?.id != restaurant.id) {
            _selectedRestaurant.value = restaurant
            _cart.value = emptyMap() // Clear cart of previous restaurant when choosing new menu
            clearRedeemedReward() // Reset loyalty discounts
        }
        navigateWithHistory(Screen.RestaurantMenu(restaurant))
    }

    // All Menu Items (for owner console search or listing)
    val allMenuItems: StateFlow<List<MenuItem>> = repository.allMenuItems
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Menu For Selected Restaurant
    @OptIn(kotlinx.coroutines.ExperimentalCoroutinesApi::class)
    val currentMenu: StateFlow<List<MenuItem>> = _selectedRestaurant
        .filterNotNull()
        .flatMapLatest { restaurant ->
            repository.getMenuForRestaurant(restaurant.id)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Specials List
    val dailySpecials: StateFlow<List<MenuItem>> = repository.dailySpecials
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    // Loyalty State
    val userLoyalty: StateFlow<UserLoyalty?> = repository.userLoyaltyFlow
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = UserLoyalty(1, 380, 380, "Silver")
        )

    // Standard available rewards list
    val loyaltyRewards = listOf(
        LoyaltyReward("r1", "Saffron Feast Discount", 100, 50.0, "Get ₹50 flat off on any order. Savor extra crispy naans!"),
        LoyaltyReward("r2", "Royal Biryani Coupon", 250, 150.0, "Get ₹150 flat off. Perfect for aromatic dum biryanis!"),
        LoyaltyReward("r3", "Tandoor Connoisseur Gift", 500, 320.0, "Get ₹320 flat off. Good for a free starter or dessert package!"),
        LoyaltyReward("r4", "Imperial Maharaja Voucher", 800, 550.0, "Get ₹550 off. Perfect for a grand dinner feast!")
    )

    private val _selectedReward = MutableStateFlow<LoyaltyReward?>(null)
    val selectedReward: StateFlow<LoyaltyReward?> = _selectedReward.asStateFlow()

    fun selectReward(reward: LoyaltyReward): Boolean {
        val loyalty = userLoyalty.value ?: return false
        if (loyalty.pointsBalance >= reward.pointsCost) {
            _selectedReward.value = reward
            return true
        }
        return false
    }

    fun clearRedeemedReward() {
        _selectedReward.value = null
    }

    // Reviews State
    val allReviews: StateFlow<List<Review>> = repository.getAllReviews()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun getRestaurantReviews(restaurantId: Int): Flow<List<Review>> {
        return repository.getRestaurantReviews(restaurantId)
    }

    fun getMenuItemReviews(menuItemId: Int): Flow<List<Review>> {
        return repository.getMenuItemReviews(menuItemId)
    }

    fun submitReview(
        restaurantId: Int,
        menuItemId: Int?,
        menuItemName: String?,
        userName: String,
        rating: Int,
        comment: String
    ) {
        viewModelScope.launch {
            val review = Review(
                restaurantId = restaurantId,
                menuItemId = menuItemId,
                menuItemName = menuItemName,
                userName = userName,
                rating = rating,
                comment = comment,
                timestamp = System.currentTimeMillis()
            )
            repository.addReview(review)
        }
    }

    // Owner Console triggers
    fun toggleMenuItemSpecial(menuItemId: Int, isSpecial: Boolean) {
        viewModelScope.launch {
            repository.updateMenuItemSpecialStatus(menuItemId, isSpecial)
        }
    }

    fun editMenuItemDetails(menuItem: MenuItem) {
        viewModelScope.launch {
            repository.updateMenuItemDetails(menuItem)
        }
    }

    // Cart Management
    private val _cart = MutableStateFlow<Map<MenuItem, Int>>(emptyMap())
    val cart: StateFlow<Map<MenuItem, Int>> = _cart.asStateFlow()

    fun addToCart(menuItem: MenuItem) {
        val currentMap = _cart.value.toMutableMap()
        val currentCount = currentMap[menuItem] ?: 0
        currentMap[menuItem] = currentCount + 1
        _cart.value = currentMap
    }

    fun removeFromCart(menuItem: MenuItem) {
        val currentMap = _cart.value.toMutableMap()
        val currentCount = currentMap[menuItem] ?: 0
        if (currentCount > 1) {
            currentMap[menuItem] = currentCount - 1
        } else {
            currentMap.remove(menuItem)
        }
        _cart.value = currentMap
    }

    fun clearCart() {
        _cart.value = emptyMap()
    }

    // Calculations
    val subtotal: StateFlow<Double> = _cart.map { cartMap ->
        cartMap.entries.sumOf { it.key.price * it.value }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val gstAndTaxes: StateFlow<Double> = subtotal.map { amt ->
        amt * 0.18 // 18% GST (standard Indian Restaurant tax)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    val deliveryFee: StateFlow<Double> = subtotal.map { amt ->
        if (amt > 0.0) 40.0 else 0.0 // Flat ₹40 delivery partner fee
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Calculated points to earn from the active order (1 point per ₹10 of subtotal spent)
    val pointsToEarn: StateFlow<Int> = subtotal.map { sub ->
        (sub / 10.0).toInt()
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val totalAmount: StateFlow<Double> = combine(subtotal, gstAndTaxes, deliveryFee, _selectedReward) { sub, gst, deliv, reward ->
        val beforeDiscount = sub + gst + deliv
        val discount = reward?.discountAmount ?: 0.0
        val finalVal = beforeDiscount - discount
        if (finalVal < 0.0) 0.0 else finalVal
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0.0)

    // Bookings
    val bookings: StateFlow<List<TableBooking>> = repository.allBookings
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun makeBooking(
        restaurantId: Int,
        restaurantName: String,
        name: String,
        phone: String,
        date: String,
        time: String,
        guests: Int,
        seating: String,
        specialRequest: String
    ) {
        viewModelScope.launch {
            val booking = TableBooking(
                restaurantId = restaurantId,
                restaurantName = restaurantName,
                guestName = name,
                guestPhone = phone,
                date = date,
                time = time,
                numGuests = guests,
                seatingArea = seating,
                specialRequest = specialRequest
            )
            repository.createBooking(booking)
            navigateTo(Screen.BookingsList)
        }
    }

    fun cancelBooking(bookingId: Int) {
        viewModelScope.launch {
            repository.cancelBooking(bookingId)
        }
    }

    // Orders
    val orders: StateFlow<List<FoodOrder>> = repository.allOrders
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )

    fun placeOrder(address: String) {
        val currentRes = _selectedRestaurant.value ?: return
        val currentCartItems = _cart.value
        if (currentCartItems.isEmpty()) return

        var summary = currentCartItems.entries.joinToString(", ") { "${it.key.name} x${it.value}" }
        val rewardUsed = _selectedReward.value
        if (rewardUsed != null) {
            summary += " (Redeemed: ${rewardUsed.title} -₹${rewardUsed.discountAmount})"
        }
        val subValue = subtotal.value
        val gstValue = gstAndTaxes.value
        val delivValue = deliveryFee.value
        val totValue = totalAmount.value
        val pointsEarnedVal = pointsToEarn.value

        viewModelScope.launch {
            val order = FoodOrder(
                restaurantId = currentRes.id,
                restaurantName = currentRes.name,
                itemsSummary = summary,
                subtotal = subValue,
                gstAndTaxes = gstValue,
                deliveryFee = delivValue,
                total = totValue,
                status = "Placed",
                pointsEarned = pointsEarnedVal
            )
            val orderId = repository.createOrder(order)
            
            // Adjust Loyalty points in the Database
            val loyalty = repository.getUserLoyalty() ?: UserLoyalty(1, 0, 0, "Bronze")
            val pointsCost = rewardUsed?.pointsCost ?: 0
            val newBalance = (loyalty.pointsBalance - pointsCost + pointsEarnedVal).coerceAtLeast(0)
            val newTotalEarned = loyalty.pointsEarnedTotal + pointsEarnedVal
            
            // Re-evaluate tier
            val newTier = when {
                newTotalEarned >= 1500 -> "Platinum"
                newTotalEarned >= 800 -> "Gold"
                newTotalEarned >= 300 -> "Silver"
                else -> "Bronze"
            }
            
            repository.updateUserLoyalty(loyalty.copy(
                pointsBalance = newBalance,
                pointsEarnedTotal = newTotalEarned,
                tier = newTier
            ))

            clearCart()
            clearRedeemedReward()
            _currentScreen.value = Screen.OrderTracking(orderId.toInt())
            
            // Kick off live updates for this order!
            startOrderSimulation(orderId.toInt())
        }
    }

    @OptIn(DelicateCoroutinesApi::class)
    private fun startOrderSimulation(orderId: Int) {
        // Use GlobalScope or viewModelScope with supervisor to survive VM scope cancellation if navigating
        GlobalScope.launch {
            delay(15000) // 15 seconds to transition to Preparing
            repository.updateOrderStatus(orderId, "Preparing")
            delay(20000) // 20 seconds to Out for Delivery
            repository.updateOrderStatus(orderId, "Out for Delivery")
            delay(25000) // 25 seconds to Delivered
            repository.updateOrderStatus(orderId, "Delivered")
        }
    }

    fun getOrderFlow(orderId: Int): Flow<FoodOrder?> {
        return repository.getOrderById(orderId)
    }
}
