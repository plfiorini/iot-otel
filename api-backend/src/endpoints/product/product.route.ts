// filepath: /workspaces/iot-otel/api-backend/src/endpoints/product/product.route.ts
import { Router } from "express";
import ProductController from "./product.controller";

const router = Router();

// Route to create a new product
router.post("/", ProductController.createProduct);

// Route to get all products
router.get("/", ProductController.getAllProducts);

// Route to get a single product by ID
router.get("/:id", ProductController.getProduct);

export default router;
