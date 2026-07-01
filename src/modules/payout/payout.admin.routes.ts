// payout.admin.routes.ts

import { Router } from "express";
import { payoutOwnerController } from "./payout.controller";
import  payoutUpload  from "./payout.upload";

const router = Router();

router.post("/",
    payoutUpload.single("receipt"),    
    payoutOwnerController);

export default router;