import express from "express";
import { storeController } from "../controllers";
const router = express.Router();

// Store Product Route.
router.post('/store-product', storeController.store);

export default router;