package com.example.data

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RestaurantRepository(private val dao: RestaurantDao) {

    val allRestaurants: Flow<List<Restaurant>> = dao.getAllRestaurants()

    fun getMenuForRestaurant(restaurantId: Int): Flow<List<MenuItem>> = dao.getMenuByRestaurant(restaurantId)

    val allMenuItems: Flow<List<MenuItem>> = dao.getAllMenuItems()

    val dailySpecials: Flow<List<MenuItem>> = dao.getDailySpecials()

    val allBookings: Flow<List<TableBooking>> = dao.getAllBookings()

    val allOrders: Flow<List<FoodOrder>> = dao.getAllOrders()

    fun getOrderById(orderId: Int): Flow<FoodOrder?> = dao.getOrderById(orderId)

    suspend fun createBooking(booking: TableBooking) = withContext(Dispatchers.IO) {
        dao.insertBooking(booking)
    }

    suspend fun cancelBooking(bookingId: Int) = withContext(Dispatchers.IO) {
        dao.updateBookingStatus(bookingId, "Cancelled")
    }

    suspend fun createOrder(order: FoodOrder): Long = withContext(Dispatchers.IO) {
        dao.insertOrder(order)
    }

    suspend fun updateOrderStatus(orderId: Int, status: String) = withContext(Dispatchers.IO) {
        dao.updateOrderStatus(orderId, status)
    }

    // --- Loyalty ---
    val userLoyaltyFlow: Flow<UserLoyalty?> = dao.getUserLoyaltyFlow()

    suspend fun getUserLoyalty(): UserLoyalty? = withContext(Dispatchers.IO) {
        dao.getUserLoyalty()
    }

    suspend fun updateUserLoyalty(loyalty: UserLoyalty) = withContext(Dispatchers.IO) {
        dao.insertUserLoyalty(loyalty)
    }

    // --- Reviews ---
    fun getAllReviews(): Flow<List<Review>> = dao.getAllReviews()

    fun getRestaurantReviews(restaurantId: Int): Flow<List<Review>> = dao.getRestaurantReviews(restaurantId)

    fun getMenuItemReviews(menuItemId: Int): Flow<List<Review>> = dao.getMenuItemReviews(menuItemId)

    suspend fun addReview(review: Review) = withContext(Dispatchers.IO) {
        dao.insertReview(review)
        
        // Dynamically update corresponding restaurant or menu item rating!
        if (review.menuItemId != null) {
            val menuId = review.menuItemId
            val menuList = dao.getAllMenuItems().first()
            val itemToUpdate = menuList.find { it.id == menuId }
            if (itemToUpdate != null) {
                val newCount = itemToUpdate.reviewCount + 1
                // Simply average calculation using previous average
                val totalRatingSum = (itemToUpdate.rating * itemToUpdate.reviewCount) + review.rating
                val newRating = (totalRatingSum / newCount)
                
                dao.updateMenuItem(itemToUpdate.copy(
                    reviewCount = newCount,
                    rating = Math.round(newRating * 10f) / 10f
                ))
            }
        } else {
            // Restaurant Review
            val restToUpdate = dao.getRestaurantById(review.restaurantId)
            if (restToUpdate != null) {
                val newCount = restToUpdate.reviewCount + 1
                val totalRatingSum = (restToUpdate.rating * restToUpdate.reviewCount) + review.rating
                val newRating = (totalRatingSum / newCount)
                
                dao.updateRestaurant(restToUpdate.copy(
                    reviewCount = newCount,
                    rating = Math.round(newRating * 10f) / 10f
                ))
            }
        }
    }

    // --- Owner Management (Specials & Items) ---
    suspend fun updateMenuItemSpecialStatus(menuItemId: Int, isSpecial: Boolean) = withContext(Dispatchers.IO) {
        val menuList = dao.getAllMenuItems().first()
        val item = menuList.find { it.id == menuItemId }
        if (item != null) {
            dao.updateMenuItem(item.copy(isSpecial = isSpecial))
        }
    }

    suspend fun updateMenuItemDetails(menuItem: MenuItem) = withContext(Dispatchers.IO) {
        dao.updateMenuItem(menuItem)
    }

    suspend fun initializeDatabaseIfEmpty() = withContext(Dispatchers.IO) {
        val currentRestaurants = dao.getAllRestaurants().first()
        if (currentRestaurants.isEmpty()) {
            // Seed Restaurants
            val restaurantSeeds = listOf(
                Restaurant(
                    id = 1,
                    name = "The Saffron Taj",
                    cuisine = "North Indian • Mughlai • Tandoor",
                    tagline = "Traditional Royal Recipes from Imperial Kitchens",
                    rating = 4.8f,
                    reviewCount = 24,
                    deliveryTime = "30-40 mins",
                    costForTwo = "₹1,200 for two",
                    address = "Block C, Connaught Place, New Delhi",
                    imageUrl = "ic_saffron"
                ),
                Restaurant(
                    id = 2,
                    name = "Dakshin Palace",
                    cuisine = "South Indian • Chettinad • Coastal Gold",
                    tagline = "The Magic of Curry Leaves, Mustard Seeds & Coconut",
                    rating = 4.7f,
                    reviewCount = 18,
                    deliveryTime = "25-35 mins",
                    costForTwo = "₹800 for two",
                    address = "Indiranagar, 100 Feet Road, Bengaluru",
                    imageUrl = "ic_coconut"
                ),
                Restaurant(
                    id = 3,
                    name = "Clay Oven Punjabi",
                    cuisine = "Punjabi Dhaba • Clay Oven • Spicy",
                    tagline = "Rich, Robust, and Full of Love from Amritsar",
                    rating = 4.6f,
                    reviewCount = 15,
                    deliveryTime = "35-45 mins",
                    costForTwo = "₹700 for two",
                    address = "Juhu Tara Road, Juhu, Mumbai",
                    imageUrl = "ic_claypot"
                )
            )
            dao.insertRestaurants(restaurantSeeds)

            // Seed Menu Items
            val menuSeeds = listOf(
                // Saffron Taj (restaurantId = 1)
                MenuItem(101, 1, "Tandoori Saffron Paneer Tikka", "Paneer cubes marinated in rich spiced yogurt, saffron, and tandoori spices, char-roasted.", 320.0, "Starters", true, true, 2, isSpecial = true),
                MenuItem(102, 1, "Murg Malai Kebab", "Boneless chicken chunks marinated in heavy cardamom cream, grated cheese, and white pepper.", 380.0, "Starters", false, false, 1, isSpecial = false),
                MenuItem(103, 1, "Grand Royal Butter Chicken", "Tender coal-smoked chicken simmered in rich tomato, butter, and cashew honey glaze.", 450.0, "Mains", false, true, 2, isSpecial = true),
                MenuItem(104, 1, "Shahi Paneer Cream Masala", "Fresh cottage cheese diamonds blanketed in dense cashew and cardamom rich cream.", 390.0, "Mains", true, false, 1, isSpecial = false),
                MenuItem(105, 1, "Imperial Dal Bukhara", "Slowly cooked cream black lentils with butter, simmered over night for signature velvety texture.", 320.0, "Mains", true, true, 1, isSpecial = false),
                MenuItem(106, 1, "Nawabi Murgh Dum Biryani", "Fragrant long-grain basmati rice layered with juicy spiced chicken, fresh mint, and pure Kashmiri saffron.", 480.0, "Biryani", false, true, 3, isSpecial = true),
                MenuItem(107, 1, "Sizzling Garlic Butter Naan", "Tandoor baked hand-stretched leavened flatbread glazed lavishly with minced garlic butter.", 80.0, "Breads", true, false, 1, isSpecial = false),
                MenuItem(108, 1, "Crispy Laccha Paratha", "Flaky and crispy multi-layered golden whole wheat flatbread.", 70.0, "Breads", true, false, 1, isSpecial = false),
                MenuItem(109, 1, "Rose Cardamom Gulab Jamun", "Sponge-soft golden milk solids soaked in warm cardamom and rose-water syrup.", 150.0, "Desserts", true, false, 1, isSpecial = false),
                MenuItem(110, 1, "Kesar Pista Shahi Kulfi", "Traditional Indian slow-churned frozen cream dessert packed with rich saffron, pistachios, and almonds.", 180.0, "Desserts", true, true, 1, isSpecial = true),

                // Dakshin Palace (restaurantId = 2)
                MenuItem(201, 2, "Ghee Roast Masala Dosa", "Stunningly crispy paper-thin rice crepe brushed with pure spiced ghee, filled with golden potato mash. Served with dual chutneys & sambar.", 180.0, "Starters", true, true, 2, isSpecial = true),
                MenuItem(202, 2, "Chettinad Pepper Chicken Fry", "Fiery dry stir-fried tender chicken tossed with fresh hand-ground black pepper, roasted curry leaves, and fennel.", 360.0, "Starters", false, true, 3, isSpecial = true),
                MenuItem(203, 2, "Classic Steamed Sambar Vadai", "Savory deep-fried crisp lentil donuts soaked fully in steaming spicy rich sambar and garnished with kori.", 120.0, "Starters", true, false, 2, isSpecial = false),
                MenuItem(204, 2, "Coastal Malabar Prawn Curry", "Juicy local bay prawns slow cooked in high-quality spiced coconut milk curry with ginger and green chilies.", 520.0, "Mains", false, true, 2, isSpecial = true),
                MenuItem(205, 2, "Paneer Karaikudi Spice", "Cottage cheese pieces baked and tossed in a traditional spicy-tangy tomato-onion ground Chettinad masala.", 380.0, "Mains", true, false, 3, isSpecial = false),
                MenuItem(206, 2, "Malabar Jackfruit Dum Biryani", "Fresh forest jackfruit parts spiced with Malabar spices and slow-cooked dum-style with premium long rice.", 395.0, "Biryani", true, false, 2, isSpecial = false),
                MenuItem(207, 2, "Lacy Malabar Parotta", "Exquisitely stretched flaky multi-layered soft southern golden parotta.", 60.0, "Breads", true, true, 1, isSpecial = false),
                MenuItem(208, 2, "Appam with sweet Coconut Milk", "Soft and fluffy rice pancakes with light golden crispy lace edges, accompanied by fresh cardamon coconut cream.", 110.0, "Breads", true, false, 1, isSpecial = false),
                MenuItem(209, 2, "Chilled Elaneer Payasam", "Creamy, naturally chilled divine dessert made of tender coconut flesh, condensed milk, and cardamom.", 165.0, "Desserts", true, true, 1, isSpecial = true),

                // Clay Oven Punjabi (restaurantId = 3)
                MenuItem(301, 3, "Amritsari Machhi Fry", "Fabulous carom-infused spiced gram-flour batter coated fried fresh fish fillets.", 390.0, "Starters", false, true, 2, isSpecial = false),
                MenuItem(302, 3, "Hara Bhara Kebab", "Delicately pan-fried pureed spinach, baby peas, and potato patties filled with secret raisins and chopped cashew.", 240.0, "Starters", true, false, 1, isSpecial = false),
                MenuItem(303, 3, "Dhaba style Kadhai Paneer", "Fresh paneer blocks and crispy bell peppers tossed with spicy whole ground coriander, ginger juliennes and red dry chilies.", 360.0, "Mains", true, true, 3, isSpecial = true),
                MenuItem(304, 3, "Sarson Ka Saag & Makki Roti", "Hearty mustard-spinach greens cooked continuously in clay pots with dollops of fresh churned white butter, served with yellow corn bread.", 310.0, "Mains", true, false, 2, isSpecial = true),
                MenuItem(305, 3, "Amritsari Spicy Butter Chicken", "Flame charred tandoori chicken shredded and tossed in spices and spicy cream tomato gravy (Amritsari Style).", 420.0, "Mains", false, true, 2, isSpecial = false),
                MenuItem(306, 3, "Pind Da Mutton Dum Biryani", "Fragrant saffron rice layered with hand-softened mutton shanks in high spicy yogurt gravy, dum-baked.", 540.0, "Biryani", false, false, 3, isSpecial = true),
                MenuItem(307, 3, "Stuffed Amritsari Potato Kulcha", "Baked leavened flatbread thick-stuffed with tangy spicy mashed potato and onion mix. Brushed with ghee.", 120.0, "Breads", true, true, 2, isSpecial = false),
                MenuItem(308, 3, "Butter tandoori Roti", "Standard brick-tandoor roasted high wheat flatbread with butter glaze.", 40.0, "Breads", true, false, 1, isSpecial = false),
                MenuItem(309, 3, "Desi Ghee Moong Dal Halwa", "Decadently hot roasted split-moong pudding cooked meticulously with ghee, sugar syrup, cardamom and dried nuts.", 140.0, "Desserts", true, true, 1, isSpecial = true)
            )
            dao.insertMenuItems(menuSeeds)

            // Seed user loyalty account
            dao.insertUserLoyalty(UserLoyalty(1, pointsBalance = 380, pointsEarnedTotal = 380, tier = "Silver"))

            // Seed initial reviews
            val reviewsSeeds = listOf(
                Review(0, 1, null, null, "Rahul Sharma", 5, "Unbelievably rich Butter Chicken! The saffron paneer was also extremely soft.", System.currentTimeMillis() - 2 * 3600000),
                Review(0, 1, null, null, "Preeti Iyer", 5, "Exquisite ambiance and the Royal Dal Bukhara tastes exactly like the original. Saffron Taj is Delhi's best Mughlai spot.", System.currentTimeMillis() - 12 * 3600000),
                Review(0, 1, 103, "Grand Royal Butter Chicken", "Aman Verma", 5, "The absolute benchmark for butter chicken. Smoky, perfectly sweet, rich honey undertones.", System.currentTimeMillis() - 500000),
                Review(0, 1, 105, "Imperial Dal Bukhara", "Devendra K.", 4, "Signature soft cooked cream lentils. Meticulously spiced and buttery.", System.currentTimeMillis() - 1700000),
                
                Review(0, 2, null, null, "Ananth Krishnan", 5, "Breathtaking filter coffee and crisp ghee roast dosa. Genuine taste of Tamil Nadu and Bengaluru hospitality.", System.currentTimeMillis() - 5 * 3600000),
                Review(0, 2, 201, "Ghee Roast Masala Dosa", "Anuradha S.", 5, "Extremely crisp, thick golden coat, and the potato filling is beautifully yellow-spiced.", System.currentTimeMillis() - 1800000),
                Review(0, 3, null, null, "Jaspreet Singh", 5, "As authentic as Amritsar's by-lanes! Best Sarson ka Saag and Crispy Machhi in town.", System.currentTimeMillis() - 25 * 3600000)
            )
            for (rev in reviewsSeeds) {
                dao.insertReview(rev)
            }
        }
    }
}
