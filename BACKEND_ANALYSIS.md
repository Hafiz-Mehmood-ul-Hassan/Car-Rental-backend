# Backend Analysis Report

## Executive Summary

The backend is a modular Express + TypeScript application for a car-rental platform with Prisma ORM and PostgreSQL. The implementation covers core user authentication, role-based access, KYC submission/review, car listing and moderation, booking lifecycle, Stripe-based payments, owner earnings, and payout records.

The codebase shows a solid domain-oriented structure and a clear separation between routes, controllers, services, repositories, and shared infrastructure. However, several important gaps and inconsistencies remain:

- The TypeScript build currently fails with multiple errors.
- Some admin and payout flows are partially implemented or mismatched with the Prisma schema.
- Stripe integration is present, but the implementation is not yet fully robust or consistent.
- Some modules still rely on direct Prisma usage inside services instead of a fully consistent repository pattern.
- The project is close to a working MVP, but it is not yet production-ready.

---

## 1. Overall Backend Architecture

### Runtime stack
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT authentication
- bcrypt for password hashing
- Multer for file uploads
- Stripe for payments
- Zod for validation

### Architectural style
The project follows a layered structure:

1. Routes
   - Define HTTP endpoints in each module.
2. Controllers
   - Receive the request, extract input, call services, and format responses.
3. Services
   - Hold business logic.
4. Repositories
   - Encapsulate Prisma queries.
5. Prisma schema
   - Defines entities, enums, and relationships.
6. Shared utilities
   - Centralize common concerns such as JWT generation, error handling, and API response formatting.

### Entry points
- [src/app.ts](src/app.ts) wires all module routes and global middleware.
- [src/server.ts](src/server.ts) starts the HTTP server and initializes background jobs.

---

## 2. Folder Structure

### Core folders
- [src/modules](src/modules)
  - auth
  - car
  - kyc
  - booking
  - payments
  - earning
  - payout
  - review
  - admin
  - availability
- [src/middleware](src/middleware)
- [src/shared](src/shared)
- [src/config](src/config)

### Important files
- [src/app.ts](src/app.ts)
- [src/server.ts](src/server.ts)
- [prisma/schema.prisma](prisma/schema.prisma)
- [src/config/prisma.ts](src/config/prisma.ts)
- [src/shared/utils/jwt.ts](src/shared/utils/jwt.ts)
- [src/middleware/auth.middleware.ts](src/middleware/auth.middleware.ts)
- [src/middleware/role.middleware.ts](src/middleware/role.middleware.ts)
- [src/middleware/error.middleware.ts](src/middleware/error.middleware.ts)

---

## 3. Module Structure

Each module typically contains:
- routes file
- controller file
- service file
- repository file
- validation file
- admin-specific variants where needed

This structure is consistent and makes the codebase reasonably maintainable.

---

## 4. Shared Utilities

### [src/shared/errors/AppError.ts](src/shared/errors/AppError.ts)
A custom error class used for domain-specific failures with an HTTP status code.

### [src/shared/responses/apiResponse.ts](src/shared/responses/apiResponse.ts)
A standard response envelope used by controllers.

### [src/shared/utils/jwt.ts](src/shared/utils/jwt.ts)
Generates JWT access tokens and refresh tokens, and verifies refresh tokens.

### [src/config/prisma.ts](src/config/prisma.ts)
Creates a Prisma client singleton.

### [src/config/upload.factory.ts](src/config/upload.factory.ts)
Centralizes file upload setup using Multer.

---

## 5. Middleware

### Authentication
- [src/middleware/auth.middleware.ts](src/middleware/auth.middleware.ts)
- Verifies JWTs from the Authorization header.
- Attaches the decoded user payload to the request.

### Authorization
- [src/middleware/role.middleware.ts](src/middleware/role.middleware.ts)
- Restricts access by role such as ADMIN, CAR_OWNER, and RENTER.

### KYC guard
- [src/middleware/kyc.middleware.ts](src/middleware/kyc.middleware.ts)
- Ensures the user has an approved KYC before accessing certain routes.

### Validation
- [src/middleware/validate.middleware.ts](src/middleware/validate.middleware.ts)
- Uses Zod to validate request bodies.

### Booking validation
- [src/middleware/validateBooking.middleware.ts](src/middleware/validateBooking.middleware.ts)
- Checks that booking input is present and structurally valid.

### Error handler
- [src/middleware/error.middleware.ts](src/middleware/error.middleware.ts)
- Converts thrown errors into JSON errors.

---

## 6. Authentication Flow

### Registration
- Route: POST /api/auth/register
- Controller: auth.controller.ts
- Service: auth.service.ts
- Repository: auth.repository.ts

Flow:
1. Validate input with Zod.
2. Check whether the email already exists.
3. Reject ADMIN self-registration.
4. Hash the password using bcrypt.
5. Create a new user in the database.

### Login
- Route: POST /api/auth/login
- Validates email/password.
- Checks the user exists and is active.
- Compares password hash with bcrypt.
- Generates an access token and refresh token.
- Stores the refresh token hash in the database.

### JWT authentication
- Access token is generated with a short expiration.
- The verifyToken middleware decodes and attaches the user payload to the request object.

### Refresh token
- Route: POST /api/auth/refresh-token
- Validates the refresh token.
- Verifies the token signature.
- Checks that the hashed token exists and has not expired.
- Issues a new access token and refresh token.

### Password recovery
- Forgot/reset password endpoints exist.
- They generate a reset token and store a hashed version in the database.
- Actual email delivery is not implemented.

---

## 7. Authorization Flow

Roles are defined in the Prisma enum:
- ADMIN
- CAR_OWNER
- RENTER

The workflow is:
1. The JWT middleware authenticates the request.
2. The roleGuard middleware checks the role against allowed roles.
3. KYC-related routes also use the kycGuard middleware.

This provides a basic role-based authorization system.

---

## 8. Error Handling

The project uses a consistent custom error pattern:
- Throw AppError with a message and status code.
- Let the global error handler format the response.

This is a good foundation, but the implementation is still a bit inconsistent. Some controllers use next(error), while others directly send responses and do not consistently pass errors to the middleware.

---

## 9. Validation

Validation is implemented with Zod in several modules:
- auth validation
- car validation
- KYC validation

This is a good practice, but not every route uses validation consistently. For example, some routes rely on manual checks instead of a schema.

---

## 10. Repository Pattern

The project partially follows a repository pattern:
- Auth, car, booking, KYC, payout, and review modules have repository files.
- However, many services still query Prisma directly.

This means the repository abstraction is present but not fully enforced everywhere.

---

## 11. Service Layer

The service layer contains the core business rules:
- Auth business rules
- Car submission and approval logic
- Booking availability checks
- Payment session creation and success validation
- Earnings aggregation
- Payout validation
- Review moderation logic

This is the strongest part of the architecture.

---

## 12. Controllers

Controllers are thin and mostly coordinate between HTTP requests and services.

Their responsibilities are:
- Extract request data
- Call a service
- Format and send a response

The structure is clear and consistent.

---

## 13. Routes

The API is grouped into clear route modules:
- /api/auth
- /api/kyc
- /api/cars
- /api/bookings
- /api/payments
- /api/reviews
- /api/payouts
- /api/earnings
- /admin

The route organization is good and modular.

---

## 14. Prisma Schema and Database Relationships

### Core entities
- User
- KYC
- Car
- CarImage
- CarDocument
- Booking
- Payment
- Earning
- Review
- Payout

### Major relationships
- User has one KYC, many cars, bookings, payments, reviews, payouts.
- Car belongs to one owner and has many bookings, images, documents, and reviews.
- Booking belongs to one user and one car and optionally one payment.
- Payment belongs to one booking and one user.
- Earning belongs to one owner.
- Payout belongs to one owner and one admin user.

### Enums
- Role
- KYCStatus
- CarStatus
- CarDocumentType
- CarDocumentStatus
- BookingStatus
- PaymentStatus
- ReviewStatus
- PayoutMethod

---

## 15. Module-by-Module Analysis

### A. Authentication Module

Purpose
- Handle registration, login, password reset, profile access, and user management.

Route flow
- Register, login, refresh-token, forgot-password, reset-password, me, change-password, me/update, me/delete.

Controller responsibilities
- Receive auth requests, call auth services, and return standard responses.

Service responsibilities
- Validate credentials, hash passwords, generate tokens, manage refresh token persistence, and handle password reset flows.

Repository responsibilities
- Query and update users in Prisma.

Tables used
- User

Business rules
- Users cannot register as ADMIN.
- Inactive users are blocked.
- Password reset tokens are hashed before storage.

Communication with other modules
- KYC module uses the user record for verification state.
- Booking and payment flows rely on the owning user record.

---

### B. Car Module

Purpose
- Allow car owners to create, upload media, submit, and manage cars.

Route flow
- Create draft car
- Upload car images
- Upload car documents
- Submit car for review
- Update availability
- Public listing of approved cars
- Owner listing of their cars

Controller responsibilities
- Receive owner requests and pass them to car services.

Service responsibilities
- Validate ownership, enforce draft submission rules, and manage status transitions.

Repository responsibilities
- Create, fetch, and update cars and their related media.

Tables used
- Car
- CarImage
- CarDocument

Business rules
- Cars start as DRAFT.
- Only DRAFT cars can accept images/documents.
- Cars must have images and required documents before review.
- Only approved cars can be publicly listed as available.

Communication with other modules
- Booking logic checks car availability and status.
- Review and admin moderation depend on car status.

---

### C. KYC Module

Purpose
- Collect and moderate user identity verification documents.

Route flow
- Submit KYC with three uploaded files
- Retrieve own KYC
- Admin fetch/pending/review flows

Controller responsibilities
- Pass request data and files into the service layer.

Service responsibilities
- Prevent duplicate KYC submission, persist file paths, and update the user’s KYC status.

Repository responsibilities
- Manage KYC records in Prisma.

Tables used
- KYC
- User

Business rules
- A user can submit only one KYC record.
- Admin approval updates both KYC status and user verification state.

Communication with other modules
- Car ownership and booking depend on KYC approval.

---

### D. Booking Module

Purpose
- Create and manage vehicle rentals.

Route flow
- Create booking
- View user bookings
- View owner bookings
- Request return
- Accept return

Controller responsibilities
- Translate HTTP requests into service calls.

Service responsibilities
- Validate date range and car availability, calculate price, create bookings, and manage lifecycle transitions.

Repository responsibilities
- Create booking records and look up booking/payment relationships.

Tables used
- Booking
- Car
- Payment

Business rules
- Bookings cannot start after they end.
- Only approved cars can be booked.
- Overlapping reservations are blocked.
- Booking state drives payment and completion flows.

Communication with other modules
- Uses the availability module to prevent conflicts.
- Creates payment records.
- Triggers earnings and payout flows after successful payment.

---

### E. Payment Module

Purpose
- Create Stripe checkout sessions and process payment success.

Route flow
- Create payment session
- Verify Stripe session
- Webhook handler
- User payment history

Controller responsibilities
- Pass checkout/payment requests to the service layer.

Service responsibilities
- Create Stripe checkout sessions, finalize successful payments, and update booking/payment state.

Repository responsibilities
- Manage payment rows and related booking lookup.

Tables used
- Payment
- Booking
- Car

Business rules
- Payment must correspond to a booking owned by the current user.
- Overlapping bookings are cancelled if a conflict exists.
- Successful payment activates the booking and marks the car as booked.

Communication with other modules
- Updates booking state.
- Interacts with earning generation.

---

### F. Earnings Module

Purpose
- Track owner earnings derived from completed bookings.

Route flow
- Earnings are created when a booking payment succeeds.
- Admin endpoints for viewing earnings exist, but the implementation is incomplete.

Controller responsibilities
- Minimal or incomplete at present.

Service responsibilities
- Calculate platform fee and owner net amount.

Repository responsibilities
- Query earnings records.

Tables used
- Earning

Business rules
- Earnings should be based on the booking amount minus platform fee.
- Remaining balance should be reduced after payouts.

Communication with other modules
- Called from booking/payment lifecycle.
- Used by payout processing.

---

### G. Payout Module

Purpose
- Process owner payouts from available earnings.

Route flow
- Admin creates a payout record and updates the owner earnings ledger.

Controller responsibilities
- Accept payout requests and pass them to the service layer.

Service responsibilities
- Validate payout amount, ensure the balance is sufficient, and execute the transaction.

Repository responsibilities
- Create payout entries and update the earning balance.

Tables used
- Payout
- Earning
- User

Business rules
- Payout amount cannot exceed remaining balance.
- Payout records should be tied to an admin user and owner user.

Communication with other modules
- Depends on the earnings module.

---

### H. Review Module

Purpose
- Allow renters to leave reviews and allow admins to moderate them.

Route flow
- Create review for a car
- Fetch visible reviews for a car
- Fetch reviews by a user
- Admin list/update/delete reviews

Controller responsibilities
- Expose review endpoints.

Service responsibilities
- Validate rating value and persist moderator state.

Repository responsibilities
- Minimal; most work uses Prisma directly in the service.

Tables used
- Review

Business rules
- Rating must be between 1 and 5.
- Only visible reviews are returned publicly.

Communication with other modules
- Reviews are attached to a car and a user.

---

### I. Admin Module

Purpose
- Provide administrative operations for KYC, cars, bookings, payments, earnings, reviews, and users.

Route flow
- Dashboard stats
- User management
- KYC moderation
- Car moderation
- Booking moderation
- Payment moderation
- Payout moderation
- Review moderation

Controller responsibilities
- Expose admin HTTP endpoints.

Service responsibilities
- Provide dashboard metrics and administrative transitions.

Repository responsibilities
- Query/admin-update data across modules.

Tables used
- User
- KYC
- Car
- Booking
- Payment
- Earning
- Review
- Payout

Business rules
- Admin actions should be restricted with role-based middleware.
- Sensitive operations must be validated and audited.

---

## 16. End-to-End User Flows

### User Registration
- User submits registration payload.
- Service validates role and uniqueness.
- Password is hashed.
- User record is created.

### Login
- Credentials are checked.
- Access and refresh tokens are generated and returned.
- Refresh token hash is stored for later validation.

### JWT authentication
- Access token is verified by middleware.
- User identity and role are attached to the request.

### Refresh token
- Client sends refresh token.
- The server verifies and rotates it.

### KYC verification
- User uploads identity documents.
- KYC is created and marked PENDING.
- Admin approves or rejects it.
- The user’s kycStatus and isVerified fields are updated.

### Car approval
- Car owner creates a draft car.
- Owner uploads images and documents.
- The owner submits the car for review.
- Admin approves or rejects the car.
- Approved cars become publicly listed.

### Booking creation
- Renter selects dates and car.
- Server checks car approval and availability.
- A booking and a payment record are created.

### Stripe checkout
- The server creates a Stripe checkout session.
- The client is redirected to Stripe.
- Session metadata stores booking and user identifiers.

### Stripe webhook
- Stripe sends a webhook event.
- The server verifies the signature.
- The payment is finalized if the session is paid.

### Payment success
- Payment status becomes SUCCESS.
- Booking becomes ACTIVE.
- Car is marked as booked.

### Booking completion
- Renter requests a return.
- Owner accepts it.
- Booking status becomes COMPLETED.
- Car becomes available again.

### Earnings update
- When payment succeeds, the earning ledger is updated.
- Platform fee is deducted and the remaining owner balance grows.

### Owner payout
- Admin processes a payout against the owner’s remaining balance.
- The payout record is created.
- The earning ledger’s paid and remaining amounts are updated.

### Review system
- A renter submits a review for a completed booking or car.
- Review remains pending until an admin marks it visible or hidden.

---

## 17. Completed Features

The following features are implemented in a usable form:
- User registration and login
- JWT-based auth
- Role-based routing for admin/owner/renter
- KYC submission and approval workflow
- Car draft creation and submission workflow
- Public car listing
- Booking creation and basic lifecycle management
- Stripe checkout session creation
- Payment record persistence
- Basic earning calculation
- Basic owner payout processing
- Review creation and admin moderation endpoints

---

## 18. Partially Implemented Features

These areas exist but are incomplete:
- Admin earnings and payout endpoints are not fully wired and are inconsistent with the schema.
- Payout routes are incomplete and not fully integrated with admin authorization.
- The review system is present but not fully enforced by business rules.
- The booking completion flow is implemented, but not all edge cases are covered.
- Stripe webhook and payment success handling need more robustness.
- Password reset is implemented only as a token generator, not as a full email-based recovery flow.

---

## 19. Missing Features

The following features are either missing or not yet production-ready:
- Email delivery for password reset and verification
- Real notification system for booking, payout, and KYC updates
- Full audit trail for admin actions
- Soft-delete or archival strategy for users and cars
- Full pagination and filtering for many lists
- Unit and integration tests
- Rate limiting and brute-force protection
- Refresh token rotation and revocation history
- Payment refund workflow
- Booking cancellation policy, penalties, and reason tracking

---

## 20. Bugs and Implementation Risks

### Verified code issues
The current TypeScript check reports multiple errors, including:
- Missing multer type declarations
- Implicit any usage in several files
- Inconsistent imports and missing exports
- Admin earnings logic using fields not present in the Prisma schema
- Incorrect controller/service wiring for payment and booking flows

### Important runtime risks
- The app uses a Windows-specific import in [src/app.ts](src/app.ts) for path handling, which can cause cross-platform issues.
- Some services use Prisma directly instead of the repository layer, making the code less consistent.
- The file upload system may behave differently depending on process working directory.
- The Stripe integration has duplicate Stripe client setup and logs secrets in one file.
- Some admin routes are not fully protected or fully consistent with the rest of the architecture.

---

## 21. Technical Debt

The main technical debt points are:
- Inconsistent use of repository vs direct Prisma calls
- Mixed naming and import styles
- Some dead or commented-out code remains
- Incomplete type safety and missing typings for upload middleware
- Admin and earnings modules need cleanup and schema alignment
- Some routes and controllers are underdeveloped compared to the domain model

---

## 22. Duplicate Logic and Refactoring Opportunities

### Duplicate logic
- Similar booking/payment activation logic appears in multiple places.
- Admin moderation flows for KYC, cars, reviews, and bookings repeat patterns.
- The same earning/payment state changes appear in different modules.

### Refactoring opportunities
- Centralize booking lifecycle transitions in a single service.
- Create shared helpers for admin moderation actions.
- Move more Prisma access to repositories.
- Consolidate Stripe and payment success handling into one unified service.
- Introduce typed request interfaces for auth and file uploads.

---

## 23. Current Implementation Status

### Status summary
- Core MVP functionality: partially implemented
- Admin workflow: partially implemented
- Payment/booking lifecycle: partially implemented
- Production readiness: not yet reached

### Confidence level
The codebase is a credible foundation for a car-rental platform, but it still requires structural cleanup and validation before being considered stable.

---

## 24. Recommended Next Development Priorities

### Priority 1: Stabilize the build
- Fix TypeScript errors.
- Add missing type definitions for multer and other deps.
- Remove incorrect imports and missing exports.

### Priority 2: Align schema and business logic
- Review the Prisma schema against all service code.
- Fix admin earnings and payout logic to match existing model fields.
- Remove invalid status transitions and dead code.

### Priority 3: Harden payment flow
- Standardize Stripe webhook and success handling.
- Implement retry-safe payment finalization.
- Add clearer payment failure handling and refund logic.

### Priority 4: Complete admin workflows
- Fully wire admin endpoints for earnings, payouts, reviews, and bookings.
- Add consistent authorization checks and audit logging.

### Priority 5: Improve reliability and security
- Add rate limiting.
- Add email-based password reset and verification.
- Add tests.
- Improve file upload path handling and validation.

### Priority 6: Refactor for consistency
- Move more logic into repositories.
- Standardize typed request objects and response helpers.
- Remove duplicate logic in booking/payment/admin modules.

---

## 25. Bottom Line

This backend is a strong starting point for a car rental platform and already implements most of the core business concepts. The architecture is modular and understandable, and the domain model is sensible. The biggest gaps are consistency, schema alignment, and completeness of the payment and admin flows.

With focused cleanup and a small set of high-impact fixes, this project can become a robust MVP and then a production-ready platform.
