# FoodKart

FoodKart is a MERN food ordering project with separate customer and restaurant administration applications. This repository is configured to run against infrastructure you provide; it contains no dependency on the upstream hosted app.

## Applications

- `frontend/`: React customer storefront with database-backed category discovery, search, cart, checkout, and order history.
- `admin/`: React menu and category CRUD, paid order management, and database-backed overview.
- `backend/`: Express API, MongoDB models, JWT authentication, and Stripe Checkout integration.

## Requirements

Node.js 18+, npm, and MongoDB. Stripe is required only for hosted card checkout. Product images use the local `backend/uploads` directory by default. Set `UPLOAD_DIR` to a persistent mounted directory in production.

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

The API defaults to `http://localhost:4000`, customer Vite to port 5173, and admin Vite to port 5173 (use `npm run dev -- --port 5174` when running both). Configure Stripe to send `checkout.session.completed` events to `POST /api/order/webhook`; signature verification uses `STRIPE_WEBHOOK_SECRET`. Order totals use trusted MongoDB product prices, `DELIVERY_CHARGE`, and the configured `CURRENCY`. Set `VITE_API_URL` in each frontend env file for another backend address. Set `CLIENT_URLS` to comma-separated allowed browser origins and `FRONTEND_URL` to your deployed customer app URL.

## Environment

`backend/.env.example` documents MongoDB, JWT, Stripe, allowed client origins, and frontend URL configuration. Use a unique random `JWT_SECRET`, a private MongoDB database, and Stripe keys from your own account. Never commit `.env` files. New admin accounts are not self-provisioned; assign the `admin` role directly in your own database after registration.

## Tests

Run `npm test` from `backend/` for category validation and controller behavior, JWT authorization over HTTP, and trusted order pricing. Run `npm test` from `frontend/` for cart subtotal tests. Run `npm run lint` and `npm run build` from both `frontend/` and `admin/` to check source quality and create production bundles. Category controller tests use mocked models; database-backed API workflows require a configured MongoDB instance.

## API overview

- `POST /api/user/register`, `POST /api/user/login`
- `GET /api/food/list`, `/api/food/categories`; `POST /api/food/add`, `/api/food/update`, `/api/food/remove`; admin category writes use `POST /api/food/categories`, `PATCH /api/food/categories/:id`, and `DELETE /api/food/categories/:id`
- `POST /api/cart/add`, `/remove`, `/get`
- `POST /api/order/place`, `/verify`, `/userorders`; `GET /api/order/list`, `/api/order/stats`; `POST /api/order/status`; Stripe webhook `POST /api/order/webhook`

Authenticated endpoints accept a JWT in the `token` header. Admin operations require an account with the `admin` database role.

## Deployment

Deploy the customer and admin Vite apps as separate static sites and the Express app as a Node service. Configure environment variables independently on each service, use MongoDB Atlas or another private MongoDB deployment, and provide persistent or managed object storage for uploaded images by setting `UPLOAD_DIR` to the mounted storage path. Configure Stripe webhooks and payment confirmation before accepting live payments. `UPLOAD_DIR` must point to persistent storage if product images should survive service restarts. No provider-specific manifests or service URLs are included; select the provider and set each frontend's `VITE_API_URL` to the deployed API URL.

## Screenshots

Add current FoodKart screenshots here after deploying or running the apps locally.
