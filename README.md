# Campus E-Canteen

> A comprehensive full-stack food ordering system designed for campus canteens with role-based dashboards, secure payments, and real-time order management.

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Made with MERN](https://img.shields.io/badge/Made%20with-MERN-blue.svg)](https://www.mongodb.com/mern-stack)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

---

## Overview

**Campus E-Canteen** is a modern, full-stack web application that digitizes the campus food ordering experience. Built with the MERN stack, it offers a seamless interface for students to browse menus, place orders, and make secure payments, while providing canteen operators and administrators with powerful management tools.

### Key Highlights

- **3 Role-Based Dashboards**: Distinct interfaces for Users, Sellers, and Admins
- **Secure Authentication**: JWT-based auth with OTP email verification
- **Payment Integration**: Stripe payment gateway with test mode support
- **Real-Time Updates**: Dynamic order status tracking
- **Responsive Design**: Mobile-first approach with modern UI
- **Image Management**: Multi-image upload with compression
- **Data Visualization**: Analytics charts for admin insights

---

## Features

### User Features
- **Browse Menu**: View available food items with images, prices, and descriptions
- **Smart Cart**: Add items to cart with quantity management
- **Search & Filter**: Find items by name or category
- **Secure Checkout**: Pay via Stripe with card details
- **Order Tracking**: Real-time order status updates (Pending → Confirmed → Preparing → Ready → Delivered)
- **Order History**: View past orders and receipts
- **Profile Management**: Edit personal information and contact details

### Seller Features
- **Menu Management**: Add, edit, and delete food items
- **Multi-Image Upload**: Upload multiple images per food item with auto-compression
- **Order Management**: View incoming orders with filtering options
- **Status Updates**: Update order status to keep customers informed
- **Real-Time Notifications**: Get notified of new orders instantly
- **Restaurant Profile**: Manage restaurant details and information
- **Revenue Tracking**: View total revenue and order statistics

### Admin Features
- **Complete Overview**: Monitor all users, sellers, restaurants, and orders
- **User Management**: View, edit, and manage all registered users
- **Restaurant Oversight**: Manage all restaurants and their food items
- **Order Analytics**: Comprehensive order tracking and filtering
- **Data Visualization**: Charts showing revenue trends, order distribution, and user statistics
- **System Control**: Full CRUD operations on all entities
- **Export Data**: Download reports and analytics

### Authentication & Security
- **JWT Authentication**: Secure token-based authentication
- **OTP Verification**: Email-based OTP for account verification
- **Password Recovery**: Forgot password flow with OTP
- **Bcrypt Hashing**: Secure password storage
- **Protected Routes**: Authorization middleware for API endpoints
- **Role-Based Access**: Different permissions for users, sellers, and admins

---

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **React Context API** - State management
- **Lucide React** - Icon library
- **Recharts** - Data visualization
- **CSS3** - Custom styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM library
- **JWT** - Authentication tokens
- **Bcrypt.js** - Password hashing
- **Multer** - File upload handling
- **Nodemailer** - Email service

### Third-Party Services
- **Stripe** - Payment processing
- **MongoDB Atlas** - Cloud database hosting
- **Cloudinary** (optional) - Image hosting and optimization

---

## Project Structure

```
Mini-Project/
├── backend/
│   ├── config/
│   │   └── db.js                    # MongoDB connection config
│   ├── controllers/
│   │   ├── authController.js        # Authentication logic
│   │   ├── emailController.js       # Email/OTP services
│   │   ├── foodItemController.js    # Food item CRUD
│   │   ├── orderController.js       # Order management
│   │   ├── paymentController.js     # Stripe integration
│   │   ├── restaurantController.js  # Restaurant management
│   │   └── userController.js        # User profile operations
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   └── upload.js                # Multer file upload
│   ├── models/
│   │   ├── FoodItem.js              # Food item schema
│   │   ├── OTP.js                   # OTP schema
│   │   ├── Order.js                 # Order schema
│   │   ├── Restaurant.js            # Restaurant schema
│   │   └── User.js                  # User schema
│   ├── routes/
│   │   ├── auth.js                  # Auth routes
│   │   ├── foodItems.js             # Food item routes
│   │   ├── orders.js                # Order routes
│   │   ├── payment.js               # Payment routes
│   │   ├── restaurant.js            # Restaurant routes
│   │   └── users.js                 # User routes
│   ├── uploads/                     # Local image storage
│   ├── .env                         # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                    # Express app entry point
│
└── e-canteen/
    ├── public/
    ├── src/
    │   ├── assets/                  # Static assets
    │   ├── components/
    │   │   ├── adminDashboard.jsx   # Admin interface
    │   │   ├── sellerDashboard.jsx  # Seller interface
    │   │   ├── userDashboard.jsx    # User interface
    │   │   ├── LandingPage.jsx      # Landing page
    │   │   ├── Login.jsx            # Login component
    │   │   ├── RegisterWithOTP.jsx  # Registration with OTP
    │   │   ├── ForgotPassword.jsx   # Password recovery
    │   │   ├── VerifyEmail.jsx      # Email verification
    │   │   └── StripePayment.jsx    # Payment component
    │   ├── context/
    │   │   └── DashboardContext.jsx # Global state management
    │   ├── images/                  # Demo food images
    │   ├── App.jsx                  # Main app component
    │   ├── App.css
    │   ├── index.css
    │   └── main.jsx                 # React entry point
    ├── .gitignore
    ├── package.json
    ├── vite.config.js
    └── index.html
```

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

### Installation

#### 1. Clone the Repository

```bash
git clone https://github.com/kartikbudarap/campus-canteen.git
cd campus-canteen
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure `.env` file:**

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/food_ordering
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_ordering

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_minimum_32_characters

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Stripe Payment
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../e-canteen

# Install dependencies
npm install

# Create .env file
touch .env
```

**Configure `.env` file:**

```env
# Development
VITE_API_URL=http://localhost:5000

# Production (update after deployment)
# VITE_API_URL=https://your-backend-url.com
```

#### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd e-canteen
npm run dev
# App runs on http://localhost:5173
```

---

## Usage

### Demo Accounts

After setup, you can create accounts with these roles:

**Admin Account:**
```
Email: admin@ecanteen.com
Role: admin
```

**Seller Account:**
```
Email: seller@ecanteen.com
Role: seller
```

**User Account:**
```
Email: user@ecanteen.com
Role: user
```

### Testing Payment

Use Stripe test card details:
```
Card Number: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 12345)
```

---

## API Documentation

### Authentication Endpoints

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
POST /api/auth/verify-otp
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### Food Items Endpoints

```http
GET    /api/food-items           # Get all food items
GET    /api/food-items/:id       # Get single food item
POST   /api/food-items           # Create food item (seller/admin)
PUT    /api/food-items/:id       # Update food item (seller/admin)
DELETE /api/food-items/:id       # Delete food item (seller/admin)
```

### Orders Endpoints

```http
GET    /api/orders               # Get orders (filtered by role)
GET    /api/orders/:id           # Get single order
POST   /api/orders               # Create new order
PUT    /api/orders/:id/status    # Update order status (seller/admin)
```

### Payment Endpoints

```http
POST /api/payment/create-payment-intent   # Create Stripe payment
POST /api/payment/confirm-payment         # Confirm payment & create order
```

### User Endpoints

```http
GET  /api/users/profile           # Get current user profile
PUT  /api/users/profile           # Update user profile
GET  /api/users                   # Get all users (admin only)
```

### Restaurant Endpoints

```http
GET  /api/restaurants             # Get all restaurants
GET  /api/restaurants/:id         # Get single restaurant
PUT  /api/restaurants/:id         # Update restaurant (seller/admin)
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## Future Enhancements

- [ ] Real-time notifications using Socket.io
- [ ] Push notifications for order updates
- [ ] Rating and review system
- [ ] Multiple restaurant support
- [ ] QR code for order pickup
- [ ] Loyalty points system
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] PDF invoice generation
- [ ] WhatsApp order notifications

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Author

**Kartikean Budarap**

- GitHub: [@kartikbudarap](https://github.com/kartikbudarap)
- LinkedIn: [Kartikean Budarap](https://www.linkedin.com/in/kartikean-budarap-29722b2b1/)
- Email: kartikbudarap@gmail.com

---

## Acknowledgments

- [MongoDB University](https://university.mongodb.com/) for database tutorials
- [Stripe Documentation](https://stripe.com/docs) for payment integration guides
- [React Documentation](https://react.dev/) for frontend best practices
- [Lucide Icons](https://lucide.dev/) for beautiful icons
- [Recharts](https://recharts.org/) for data visualization
- Campus community for testing and feedback

---

## Support

For support, email kartikbudarap@gmail.com or open an issue in the repository.

---


<div align="center">

**Built with ❤️ for campus communities**

</div>
