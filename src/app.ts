import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import kycRoutes from "./modules/kyc/kyc.routes";
import cors from "cors";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json());


app.use("/api/auth", authRoutes);
app.use("/api/kyc", kycRoutes);


app.use(errorHandler);
export default app;