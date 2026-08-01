# Campus E-Canteen

A full-stack food ordering system for campus canteens. The repository contains a Node.js/Express backend and a React/Vite frontend with role-based dashboards for users, sellers, and admins.

## Overview

This project supports menu browsing, cart management, order tracking, payments, OTP-based authentication, and admin/seller dashboards for managing restaurants, food items, and orders.

## Tech Stack

Frontend:
- React 19
- Vite
- React Router
- Recharts
- Lucide React

Backend:
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Multer for uploads
- Nodemailer for OTP email flows

Payments:
- Stripe
- Razorpay

## Repository Structure

```text
Food Ordering adding Routes/
├── backend/        Express API, controllers, routes, models, and scripts
└── e-canteen/      React + Vite frontend
```

## Setup

### Prerequisites

- Node.js 16 or later
- npm
- MongoDB or MongoDB Atlas

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/` with the values your app uses. Based on the server code, the important variables are:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/food_ordering
JWT_SECRET=your_secret_here
PICKUP_SECRET=a_separate_long_random_secret
PICKUP_TTL_SECONDS=1800
REDIS_URL=redis://127.0.0.1:6379
CLIENT_URL=http://localhost:5173
STRIPE_SECRET_KEY=your_stripe_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

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
npm start
```

Start the frontend in a second terminal:

```bash
cd e-canteen
npm run dev
```


## Secure Pickup Verification

When a seller marks a paid order as ready, the API creates an encrypted, expiring pickup pass. The customer can display its QR code or six-digit fallback PIN. Sellers must verify one of those credentials before the order can move from `ready` to `completed`.

Redis is optional in local development. When `REDIS_URL` is configured, it stores short-lived pickup-token mappings and verification-attempt rate limits. MongoDB remains the permanent audit source, so pickup verification still works if Redis is unavailable.

Counter QR scanners can enter the QR token directly into the seller verification field. Verification is limited to five failed attempts before a five-minute lockout.
## Available Scripts

Backend:
- `npm start` runs the API in production mode
- `npm run dev` starts the API with nodemon
- `npm test` runs the backend pricing test suite

Frontend:
- `npm run dev` starts the Vite dev server
- `npm run build` creates a production build
- `npm run lint` runs ESLint
- `npm run preview` previews the production build

## API Routes

The backend exposes routes under `/api` for auth, food items, orders, payments, restaurants, users, and a health check at `/api/health`.

## Notes

- The backend serves uploaded files from `/uploads`.
- Demo data can be initialized through the admin-only `/api/init-demo` route.
- If you delete files from the repository and want Git to track the new structure, stage the removals with `git add -A` before committing.

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

