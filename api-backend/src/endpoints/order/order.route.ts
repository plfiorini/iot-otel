import { Router } from "express";
import OrderController from "./order.controller";

const router = Router();

// Route to create a new order
router.post("/", OrderController.createOrder);

// Route to get all orders
router.get("/", OrderController.getAllOrders);

// Route to get a single order by ID
router.get("/:id", OrderController.getOrder);

export default router;
