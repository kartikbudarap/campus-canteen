# Campus E-Canteen

A full-stack food ordering system for campus canteens. Students browse the menu, add items to a cart, pay online, and pick up their food using a secure QR/PIN verification flow. Sellers manage incoming orders in real time, while admins handle menus, analytics, and platform settings.

## Features

- **Menu browsing** with category filters and search
- **Cart management** with server-side price validation (₹50 minimum order)
- **Razorpay payments** — hosted checkout in test/live mode with signed demo fallback
- **OTP-based authentication** — email verification, password reset, and rate-limited OTP flows
- **Role-based dashboards** — separate views for users, sellers, and admins
- **Real-time order updates** via Socket.io (order created / status changed)
- **Secure pickup verification** — encrypted QR code + 6-digit PIN with expiry and brute-force lockout
- **Analytics & reports** — revenue charts, order stats, and Excel export
- **Admin menu management** — CRUD food items with image upload
- **Restaurant settings** — logo, name, and configuration
- **Profile management** — avatar upload and password change

## Tech Stack

**Frontend**

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Framework    | React 19                                    |
| Build        | Vite 7                                      |
| Routing      | React Router 7                              |
| Styling      | Tailwind CSS 4                              |
| Charts       | Recharts                                    |
| Icons        | Lucide React                                |
| Payments     | @stripe/react-stripe-js, Razorpay           |
| QR Codes     | qrcode.react, html5-qrcode                  |
| Realtime     | socket.io-client                            |
| Export       | xlsx                                        |

**Backend**

| Layer        | Technology                                  |
| ------------ | ------------------------------------------- |
| Runtime      | Node.js + Express 5                         |
| Database     | MongoDB with Mongoose                       |
| Auth         | JWT + bcrypt, OTP via Nodemailer            |
| Payments     | Razorpay (primary), Stripe                  |
| Realtime     | Socket.io                                   |
| Uploads      | Multer                                      |
| Cache        | Redis (optional — pickup tokens & rate limits) |
| Security     | HMAC-SHA256 hashing, AES-256-GCM encryption, timing-safe comparison |

## Repository Structure

```text
campus-canteen/
├── backend/
│   ├── config/           # Database connection
│   ├── controllers/      # Route handlers (auth, orders, payments, etc.)
│   ├── middleware/        # JWT auth, role authorization, rate limiting, security headers, file upload
│   ├── models/           # Mongoose schemas (User, Order, FoodItem, Restaurant, OTP)
│   ├── realtime/         # Socket.io initialization and event emitters
│   ├── routes/           # Express route definitions
│   ├── scripts/          # Demo data seeder
│   ├── test/             # Node.js test runner tests
│   ├── uploads/          # User-uploaded images (gitignored)
│   ├── utils/            # Order pricing, pickup credential helpers
│   ├── server.js         # App entry point
│   └── .env.example      # Environment variable template
│
└── e-canteen/
    ├── public/           # Static assets
    └── src/
        ├── components/
        │   ├── dashboard/
        │   │   ├── admin/    # Admin dashboard, analytics, menu CRUD, reports, settings
        │   │   ├── seller/   # Seller dashboard, order management, profile
        │   │   ├── user/     # User dashboard, menu, cart, orders, profile
        │   │   └── common/   # Header, sidebar, modal, loading spinner
        │   ├── Login.jsx
        │   ├── RegisterWithOTP.jsx
        │   ├── ForgotPassword.jsx
        │   ├── VerifyEmail.jsx
        │   ├── LandingPage.jsx
        │   ├── RazorpayDemoPayment.jsx
        │   ├── StripePayment.jsx
        │   └── layouts/      # Layout wrappers
        ├── context/          # DashboardContext (auth, cart, orders, socket state)
        ├── App.jsx           # Router & route definitions
        └── main.jsx          # React entry point
```

## Setup

### Prerequisites

- **Node.js** 18 or later
- **npm**
- **MongoDB** (local) or a MongoDB Atlas connection string

### Backend

```bash
cd backend
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env
```

`.env.example` contents:

```env
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://localhost:27017/food-ordering
JWT_SECRET=replace_with_a_long_random_secret

# Optional: add Razorpay Test Mode keys to use hosted checkout.
# Without them, the app uses the signed local demo payment simulator.
RAZORPAY_KEY_ID=rzp_test_replace_me
RAZORPAY_KEY_SECRET=replace_me
```

> [!TIP]
> The app works without Razorpay keys — it falls back to a signed demo payment simulator. Add test-mode keys when you're ready to try real checkout flows.

Optional variables (add to `.env` as needed):

| Variable              | Purpose                                        |
| --------------------- | ---------------------------------------------- |
| `PICKUP_SECRET`       | Separate secret for pickup pass encryption (defaults to `JWT_SECRET`) |
| `PICKUP_TTL_SECONDS`  | Pickup pass expiry (default `1800` = 30 min)   |
| `REDIS_URL`           | Redis connection for pickup token cache & rate limiting |
| `STRIPE_SECRET_KEY`   | Stripe secret key (if using Stripe payments)   |
| `EMAIL_USER`          | Gmail address for OTP emails                   |
| `EMAIL_PASS`          | Gmail app password                             |

### Frontend

```bash
cd e-canteen
npm install
```

Create a `.env` file in `e-canteen/`:

```env
VITE_API_URL=http://localhost:5000
```

## Run Locally

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd e-canteen
npm run dev
```

The frontend opens at **http://localhost:5173** and proxies API calls to port 5000.

## Secure Pickup Verification

When a seller marks a paid order as **ready**, the API creates an encrypted, expiring pickup pass. The customer can display its QR code or six-digit fallback PIN. Sellers must verify one of those credentials before the order can move from `ready` to `completed`.

- Credentials are encrypted with **AES-256-GCM** and verified via **HMAC-SHA256** with timing-safe comparison
- Verification is limited to **5 failed attempts** before a **5-minute lockout**
- Redis is optional — when `REDIS_URL` is configured, it stores short-lived pickup-token mappings and rate limits; MongoDB remains the permanent audit source
- Counter QR scanners can enter the QR token directly into the seller verification field

## Available Scripts

### Backend

| Command         | Description                                  |
| --------------- | -------------------------------------------- |
| `npm run dev`   | Start the API with nodemon (hot reload)      |
| `npm start`     | Run the API in production mode               |

### Frontend

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server          |
| `npm run build`   | Create a production build          |
| `npm run lint`    | Run ESLint                         |
| `npm run preview` | Preview the production build       |

## API Reference

All routes are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Auth — `/api/auth`

| Method | Path                  | Auth | Description              |
| ------ | --------------------- | ---- | ------------------------ |
| POST   | `/register`           | No   | Register a new user      |
| POST   | `/login`              | No   | Log in and receive JWT   |
| GET    | `/me`                 | Yes  | Get current user profile |
| POST   | `/forgot-password`    | No   | Request password reset OTP |
| POST   | `/verify-otp`         | No   | Verify OTP code          |
| POST   | `/reset-password`     | No   | Reset password with OTP  |
| POST   | `/resend-otp`         | No   | Resend OTP               |
| POST   | `/verify-email`       | No   | Verify email address     |
| POST   | `/resend-verification`| No   | Resend verification email |

### Food Items — `/api/food-items`

| Method | Path               | Auth  | Description                  |
| ------ | ------------------ | ----- | ---------------------------- |
| GET    | `/`                | No    | List all food items          |
| GET    | `/data/categories` | No    | List available categories    |
| GET    | `/:id`             | No    | Get a single food item       |
| POST   | `/`                | Admin | Create food item (with image)|
| PUT    | `/:id`             | Admin | Update food item             |
| DELETE | `/:id`             | Admin | Delete food item             |

### Orders — `/api/orders`

| Method | Path                  | Auth          | Description               |
| ------ | --------------------- | ------------- | ------------------------- |
| GET    | `/`                   | Yes           | List orders (filtered by role) |
| GET    | `/stats/overview`     | Seller/Admin  | Order statistics           |
| GET    | `/:id`                | Yes           | Get order details          |
| GET    | `/:id/pickup-pass`    | User          | Get encrypted pickup pass  |
| POST   | `/`                   | Yes           | Create a new order         |
| PATCH  | `/:id/status`         | Seller/Admin  | Update order status        |
| POST   | `/:id/verify-pickup`  | Seller/Admin  | Verify pickup credentials  |

### Payments — `/api/payment`

| Method | Path               | Auth | Description                 |
| ------ | ------------------ | ---- | --------------------------- |
| POST   | `/razorpay/order`  | Yes  | Create a Razorpay order     |
| POST   | `/razorpay/verify` | Yes  | Verify Razorpay payment     |
| GET    | `/status`          | No   | Get payment gateway status  |

### Restaurant — `/api/restaurant`

| Method | Path | Auth  | Description               |
| ------ | ---- | ----- | ------------------------- |
| GET    | `/`  | No    | Get restaurant info       |
| PUT    | `/`  | Admin | Update restaurant details |

### Users — `/api/users`

| Method | Path               | Auth | Description          |
| ------ | ------------------ | ---- | -------------------- |
| GET    | `/profile`         | Yes  | Get user profile     |
| PUT    | `/profile`         | Yes  | Update profile/avatar|
| PUT    | `/change-password` | Yes  | Change password      |

### Utility

| Method | Path             | Auth  | Description           |
| ------ | ---------------- | ----- | --------------------- |
| GET    | `/api/health`    | No    | Health check          |
| POST   | `/api/init-demo` | Admin | Seed demo data        |

## Real-Time Events (Socket.io)

The server authenticates WebSocket connections using the same JWT token. Clients automatically join rooms based on their user ID and role.

| Event              | Direction       | Description                              |
| ------------------ | --------------- | ---------------------------------------- |
| `orders:snapshot`  | Server → Client | Initial batch of recent orders on connect |
| `realtime:ready`   | Server → Client | Connection confirmation                   |
| `order:created`    | Server → Client | Broadcast when a new order is placed      |
| `order:updated`    | Server → Client | Broadcast when an order status changes    |

## Notes

- Uploaded files are served from `/uploads`
- Demo data can be initialized through the admin-only `POST /api/init-demo` route
- The server sets security headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`) on every response
- Auth and OTP routes are rate limited (10 req/15 min for auth, 5 req/10 min for OTP)
- Request body size is limited to 1 MB

## Future Enhancements

- [x] Real-time notifications using Socket.io
- [x] QR code for order pickup
- [ ] Push notifications for order updates
- [ ] Rating and review system
- [ ] Multiple restaurant support
- [ ] Loyalty points system
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] PDF invoice generation
- [ ] WhatsApp order notifications

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## Author

**Kartikean Budarap**

- GitHub: [@kartikbudarap](https://github.com/kartikbudarap)
- LinkedIn: [Kartikean Budarap](https://www.linkedin.com/in/kartikean-budarap-29722b2b1/)
- Email: kartikbudarap@gmail.com

---

## Acknowledgments

- [MongoDB University](https://university.mongodb.com/) for database tutorials
- [Razorpay Documentation](https://razorpay.com/docs/) for payment integration guides
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
