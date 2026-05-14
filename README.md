# 🚗 Car Rental Backend API

A scalable backend system for a **Car Rental Platform** built with **Node.js, Express, TypeScript, Prisma, and PostgreSQL**.

It includes authentication, role-based access control, and a complete **KYC verification system with admin approval workflow**.

---

# 🚀 Features

## 🔐 Authentication System
- User registration & login
- JWT authentication
- Role-based access control (ADMIN, CAR_OWNER, RENTER)
- Password hashing using bcrypt

---

## 👤 User Management
- Role-based users
- Secure login system
- Profile-ready structure

---

## 🧾 KYC Verification System
- Submit KYC with file upload
- CNIC front/back + selfie upload
- Admin approval / rejection system
- Review note support (reason for approval/rejection)
- Auto sync with user verification status

---

## 🛡️ Security Features
- JWT middleware authentication
- Role-based route protection
- Input validation using Zod
- Global error handling
- CORS protection

---

# 🏗️ Tech Stack

- Node.js
- Express.js
- TypeScript
- PostgreSQL
- Prisma ORM
- JWT Authentication
- Multer (File Uploads)
- Zod (Validation)
- CORS

---

# 📁 Project Structure
src/
│
├── modules/
│ ├── auth/
│ │ ├── auth.controller.ts
│ │ ├── auth.service.ts
│ │ ├── auth.repository.ts
│ │ ├── auth.routes.ts
│ │ └── auth.validation.ts
│ │
│ ├── kyc/
│ │ ├── kyc.controller.ts
│ │ ├── kyc.service.ts
│ │ ├── kyc.repository.ts
│ │ ├── kyc.routes.ts
│ │ └── kyc.validation.ts
│
├── config/
│ ├── prisma.ts
│ ├── upload.ts
│
├── middlewares/
│ ├── auth.middleware.ts
│ ├── validate.middleware.ts
│ ├── error.middleware.ts
│
├── routes/
│ └── index.ts
│
├── shared/
│ ├── errors/
│ ├── responses/
│
├── app.ts
├── server.ts

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/car-rental-backend.git
cd car-rental-backend

2️⃣ Install Dependencies
npm install

3️⃣ Setup Environment Variables

Create .env file:

PORT=5000
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000

4️⃣ Prisma Setup
npx prisma generate
npx prisma migrate dev

5️⃣ Run Server
npm run dev