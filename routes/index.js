import express from "express";
import { storeController } from "../controllers";
const router = express.Router();

// Store Product Route.
router.post('/admin/product', storeController.store);

export default router;