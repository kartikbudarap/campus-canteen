const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const FoodItem = require('../models/FoodItem');
const Restaurant = require('../models/Restaurant');
const Order = require('../models/Order');

const initDemo = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/e-canteen');
    console.log('📦 Connected to MongoDB for demo data initialization...');

    // Clear existing data
    await User.deleteMany({});
    await FoodItem.deleteMany({});
    await Order.deleteMany({});
    console.log('🧹 Cleared existing data...');

    // Create demo users
    const demoUsers = [
      {
        fullname: "Admin User",
        email: "admin@food.com",
        password: await bcrypt.hash("admin123", 12),
        role: "admin",
        phone: "+91 9876543210",
        address: "Admin Address, Mumbai"
      },
      {
        fullname: "Seller User",
        email: "seller@food.com",
        password: await bcrypt.hash("seller123", 12),
        role: "seller",
        phone: "+91 9876543211",
        address: "Seller Address, Mumbai"
      },
      {
        fullname: "Regular User",
        email: "user@food.com",
        password: await bcrypt.hash("user123", 12),
        role: "user",
        phone: "+91 9876543212",
        address: "User Address, Mumbai"
      }
    ];

    const createdUsers = await User.insertMany(demoUsers);
    console.log('👥 Created demo users...');

    // Create demo food items
    const demoFoodItems = [
      {
        name: "Vada Pav",
        description: "Spicy potato fritter in a bun with chutneys - Mumbai's favorite street food",
        price: 25,
        category: "Snacks",
        isAvailable: true,
        image: "https://www.cookwithmanali.com/wp-content/uploads/2018/04/Vada-Pav-500x500.jpg",
        ingredients: ["Potato", "Gram Flour", "Bun", "Garlic Chutney", "Tamarind Chutney"],
        preparationTime: 10,
        spicyLevel: "medium"
      },
      {
        name: "Samosa",
        description: "Crispy golden pastry filled with spiced potatoes and peas, served with chutneys",
        price: 20,
        category: "Snacks",
        isAvailable: true,
        image: "https://www.indianhealthyrecipes.com/wp-content/uploads/2021/12/samosa-recipe.jpg",
        ingredients: ["Flour", "Potato", "Peas", "Spices", "Green Chilies"],
        preparationTime: 15,
        spicyLevel: "medium"
      },
      {
        name: "Margherita Pizza",
        description: "Classic cheese pizza with fresh tomato sauce and mozzarella cheese",
        price: 299,
        category: "Main Course",
        isAvailable: true,
        image: "https://media-assets.swiggy.com/swiggy/image/upload/f_auto,q_auto,fl_lossy/RX_THUMBNAIL/IMAGES/VENDOR/2024/6/26/ebdf270d-8e2b-43de-ae89-03bdfd6ece46_222542.JPG",
        ingredients: ["Pizza Dough", "Tomato Sauce", "Mozzarella Cheese", "Basil", "Olive Oil"],
        preparationTime: 25,
        spicyLevel: "mild"
      },
      {
        name: "Cold Drink",
        description: "Refreshing chilled soft drink to quench your thirst",
        price: 50,
        category: "Beverages",
        isAvailable: true,
        image: "https://jalojog.com/wp-content/uploads/2024/04/Plain_Cold_Drink.jpg",
        ingredients: ["Carbonated Water", "Sugar", "Natural Flavors"],
        preparationTime: 2,
        spicyLevel: "mild"
      },
      {
        name: "Chicken Biryani",
        description: "Fragrant basmati rice cooked with mixed vegetables and aromatic spices",
        price: 180,
        category: "Main Course",
        isAvailable: true,
        image: "https://www.cubesnjuliennes.com/wp-content/uploads/2020/01/Chicken-Biryani.jpg",
        ingredients: ["Basmati Rice", "Mixed Vegetables", "Biryani Masala", "Saffron", "Mint"],
        preparationTime: 30,
        spicyLevel: "medium"
      },
      {
        name: "Classic Burger",
        description: "Juicy burger patty with fresh vegetables, cheese and special sauces in a soft bun",
        price: 120,
        category: "Fast Food",
        isAvailable: true,
        image: "https://www.foodandwine.com/thmb/jldKZBYIoXJWXodRE9ut87K8Mag=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/crispy-comte-cheesburgers-FT-RECIPE0921-6166c6552b7148e8a8561f7765ddf20b.jpg",
        ingredients: ["Burger Bun", "Vegetable Patty", "Lettuce", "Tomato", "Cheese", "Sauces"],
        preparationTime: 15,
        spicyLevel: "mild"
      },
      {
        name: "Chicken Shawarma",
        description: "Middle Eastern wrap with spiced chicken, fresh vegetables and garlic sauce",
        price: 150,
        category: "Fast Food",
        isAvailable: true,
        image: "https://www.thefooddictator.com/wp-content/uploads/2022/11/lambshawarma.jpeg",
        ingredients: ["Chicken", "Pita Bread", "Garlic Sauce", "Pickles", "French Fries"],
        preparationTime: 20,
        spicyLevel: "hot"
      },
      {
        name: "Masala Dosa",
        description: "Crispy rice crepe filled with spiced potato filling, served with sambar and chutney",
        price: 80,
        category: "South Indian",
        isAvailable: true,
        image: "https://www.vegrecipesofindia.com/wp-content/uploads/2021/05/masala-dosa-1.jpg",
        ingredients: ["Rice Batter", "Potato", "Mustard Seeds", "Curry Leaves", "Urad Dal"],
        preparationTime: 20,
        spicyLevel: "medium"
      }
    ];

    const createdFoodItems = await FoodItem.insertMany(demoFoodItems);
    console.log('🍕 Created demo food items...');

    // Create default restaurant info
    await Restaurant.findOneAndUpdate(
      {},
      {
        name: "Tasty Bites Restaurant",
        phone: "+91 9876543210",
        email: "info@tastybites.com",
        address: "123 Food Street, Colaba, Mumbai, Maharashtra 400001",
        openingHours: "9:00 AM - 11:00 PM",
        description: "Serving delicious and authentic food since 2010. We take pride in using fresh ingredients and traditional recipes to bring you the best dining experience."
      },
      { upsert: true, new: true }
    );
    console.log('🏪 Created restaurant information...');

    // ✅ FIXED: Create sample orders one by one to avoid orderNumber conflicts
    console.log('📦 Creating sample orders...');
    
    const order1 = new Order({
      user: createdUsers[2]._id, // Regular user
      items: [
        {
          foodItem: createdFoodItems[0]._id,
          name: createdFoodItems[0].name,
          price: createdFoodItems[0].price,
          quantity: 2
        },
        {
          foodItem: createdFoodItems[1]._id,
          name: createdFoodItems[1].name,
          price: createdFoodItems[1].price,
          quantity: 1
        }
      ],
      total: 70,
      customerName: "Regular User",
      customerPhone: "+91 9876543212",
      deliveryAddress: "User Address, Mumbai",
      status: "completed"
    });
    await order1.save();

    const order2 = new Order({
      user: createdUsers[2]._id,
      items: [
        {
          foodItem: createdFoodItems[2]._id,
          name: createdFoodItems[2].name,
          price: createdFoodItems[2].price,
          quantity: 1
        }
      ],
      total: 299,
      customerName: "Regular User",
      customerPhone: "+91 9876543212",
      deliveryAddress: "User Address, Mumbai",
      status: "preparing"
    });
    await order2.save();

    console.log('📦 Created sample orders...');

    console.log('✅ Demo data initialization completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('👑 Admin: admin@food.com / admin123');
    console.log('👨‍🍳 Seller: seller@food.com / seller123');
    console.log('👤 User: user@food.com / user123');
    console.log('\n🚀 You can now start using the application!');

    return {
      message: "Demo data initialized successfully",
      users: createdUsers.length,
      foodItems: createdFoodItems.length,
      orders: 2
    };

  } catch (error) {
    console.error('❌ Error initializing demo data:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
  }
};

// Run if called directly
if (require.main === module) {
  initDemo().catch(console.error);
}

module.exports = { initDemo };