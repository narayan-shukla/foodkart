# FoodKart Project Status

## Completed
- Removed obfuscated executable code from Vite configs and upstream hosted API dependencies.
- Added JWT expiry and server-side role checks, registration validation, CORS allowlisting, startup DB checks, and endpoint rate limits.
- Checkout calculates trusted MongoDB prices; Stripe sessions are verified server-side and signed webhooks settle paid orders idempotently.
- Added food create/edit/delete, safe uploads, live admin metrics, order management, and unpaid-order status protection.
- Added database-backed category CRUD. Category rename updates matching menu items; deletion is blocked while items still use that category.
- Wired dynamic categories into customer discovery and admin add/edit forms.
- Improved customer mobile navigation and hero layout, replaced stale Tomato branding, and made admin navigation/forms/lists adapt to narrow screens.
- Added customer cart/order empty and error states and local cart persistence.
- Reviewed customer and admin layouts at the available browser sizes, corrected mobile customer navigation/hero and narrow admin layouts, and ran both app linters cleanly.
- Added HTTP auth integration coverage plus category validation/controller tests; backend API tests, customer tests, and both production builds pass.

## Remaining
- Verify category CRUD with a live MongoDB and full admin login session.
- Complete browser visual checks at tablet/desktop customer and mobile admin sizes; current environment allowed a mobile customer and desktop admin review but not a full viewport matrix.
- Expand checkout, order status, admin API, and browser-level workflow tests. Current backend tests cover auth over HTTP, category controller behavior with mocked models, and price calculation; they do not exercise a live database or browser workflows.
- Use distributed rate limiting for multi-instance production.
- Support delayed Stripe payment methods and verify live webhook delivery.
- Configure and verify persistent image storage for the target deployment.

## Tests and builds
- Backend tests pass (8 subtests): auth HTTP integration, category validation/controller behavior, and trusted order pricing.
- Frontend tests pass (2 subtests): cart subtotal and malformed/loading cart cases.
- Backend JavaScript syntax checks pass; frontend and admin ESLint checks pass.
- Customer and admin Vite production builds pass.
- Database-backed category CRUD, Stripe flows, and order workflows were not exercised because private service credentials are not configured.

## Latest milestone
- Added full category CRUD APIs and admin UI, connected categories to customer discovery and menu editing, made upload storage configurable, fixed responsive/branding issues, and added API/controller test coverage.

## Deployment blockers
- Configure private MongoDB, JWT secret, Stripe secret and webhook secret, frontend origin allowlist, and a persistent `UPLOAD_DIR` in the deployment environment.
- The repository documents independent static frontend/admin and Node API deployment, but has no provider-specific deployment manifests because no target provider or service URLs are configured.
