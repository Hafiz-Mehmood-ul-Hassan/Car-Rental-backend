import express from "express";
import { getAvailability } from "./availability.controller";

const router = express.Router();

router.get("/cars/:id/availability", getAvailability);

export default router;