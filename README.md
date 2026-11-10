# FoodKart

FoodKart is a MERN food ordering project with separate customer and restaurant administration applications. This repository is configured to run against infrastructure you provide; it contains no dependency on the upstream hosted app.

## Applications

- `frontend/`: React customer storefront, cart, checkout, and order history.
- `admin/`: React menu and order management interface.
- `backend/`: Express API, MongoDB models, JWT authentication, and Stripe Checkout integration.

## Requirements

Node.js 18+, npm, and MongoDB. Stripe is required only for hosted card checkout. Product images are stored locally in `backend/uploads` by default; configure persistent storage before using this mode in production.

## Setup

Install packages in each application directory with `npm install`. Copy each `.env.example` to `.env` and set values for your own services.

Backend:

```sh
cd backend
cp .env.example .env
npm run server
```

Customer site:

```sh
cd frontend
cp .env.example .env
npm run dev
```

Admin site:

```sh
cd admin
cp .env.example .env
npm run dev
```

The API defaults to `http://localhost:4000`, customer Vite to port 5173, and admin Vite to port 5173 (use `npm run dev -- --port 5174` when running both). Set `VITE_API_URL` in each frontend env file for another backend address. Set `CLIENT_URLS` to comma-separated allowed browser origins and `FRONTEND_URL` to your deployed customer app URL.

## Environment

`backend/.env.example` documents MongoDB, JWT, Stripe, allowed client origins, and frontend URL configuration. Use a unique random `JWT_SECRET`, a private MongoDB database, and Stripe keys from your own account. Never commit `.env` files. New admin accounts are not self-provisioned; assign the `admin` role directly in your own database after registration.

## API overview

- `POST /api/user/register`, `POST /api/user/login`
- `GET /api/food/list`, `POST /api/food/add`, `POST /api/food/remove`
- `POST /api/cart/add`, `/remove`, `/get`
- `POST /api/order/place`, `/verify`, `/userorders`; `GET /api/order/list`; `POST /api/order/status`

Authenticated endpoints accept a JWT in the `token` header. Admin operations require an account with the `admin` database role.

## Deployment

Deploy the two Vite apps as separate static sites and the Express app as a Node service. Configure environment variables independently on each service, use MongoDB Atlas or another private MongoDB deployment, and provide persistent or managed object storage for uploaded images. Configure Stripe webhooks and payment confirmation before accepting live payments. No service URL is supplied by this repository.

## Screenshots

Add current FoodKart screenshots here after deploying or running the apps locally.
