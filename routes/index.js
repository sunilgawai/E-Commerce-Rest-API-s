import express from "express";
import { productController } from "../controllers";
const router = express.Router();

// Store Product Route.
router.post('/admin/product', productController.store);

// Update Order
router.put('/admin/product/:id', productController.update);

// Delete Product.
router.delete('/admin/product/:id', productController.destroy);

// Get All Products.
router.get('/products', productController.index);

// Get Single Product.
router.get('/product/:id', productController.show);

// Get Cart Items.
router.get('/cart', productController.cart);

export default router;