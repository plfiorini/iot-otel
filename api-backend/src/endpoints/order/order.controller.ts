import type { Request, Response } from "express";
import OrderService from "./order.service";

class OrderController {
	/**
	 * Handles the creation of a new order.
	 */
	async createOrder(req: Request, res: Response): Promise<void> {
		try {
			const orderData = req.body;
			// Add more robust validation here (e.g., using a library like Zod or Joi)
			if (!orderData || typeof orderData !== "object") {
				res.status(400).json({ message: "Invalid request body" });
				return;
			}

			const newOrder = await OrderService.ingestOrder(orderData);
			res.status(201).json(newOrder);
		} catch (error) {
			console.error("Error in OrderController.createOrder:", error);
			if (error instanceof Error) {
				// Check for specific validation errors from the service
				if (
					error.message.includes("Missing required order fields") ||
					error.message.includes("Quantity must be positive")
				) {
					res.status(400).json({ message: error.message });
				} else if (error.message.includes("Failed to ingest order")) {
					// Could be a database constraint error (like unique orderId)
					res.status(409).json({
						message:
							"Failed to create order. It might already exist or there was a conflict.",
					});
				} else {
					res
						.status(500)
						.json({ message: "Internal server error while creating order" });
				}
			} else {
				res.status(500).json({ message: "An unknown error occurred" });
			}
		}
	}

	/**
	 * Handles retrieving a single order by ID.
	 */
	async getOrder(req: Request, res: Response): Promise<void> {
		try {
			const id = Number.parseInt(req.params.id, 10); // Use Number.parseInt
			if (Number.isNaN(id)) {
				// Use Number.isNaN
				res.status(400).json({ message: "Invalid order ID format" });
				return;
			}

			const order = await OrderService.getOrderById(id);
			if (order) {
				res.status(200).json(order);
			} else {
				res.status(404).json({ message: "Order not found" });
			}
		} catch (error) {
			console.error("Error in OrderController.getOrder:", error);
			res
				.status(500)
				.json({ message: "Internal server error while retrieving order" });
		}
	}

	/**
	 * Handles retrieving all orders.
	 */
	async getAllOrders(req: Request, res: Response): Promise<void> {
		try {
			const orders = await OrderService.getAllOrders();
			res.status(200).json(orders);
		} catch (error) {
			console.error("Error in OrderController.getAllOrders:", error);
			res
				.status(500)
				.json({ message: "Internal server error while retrieving orders" });
		}
	}
}

// Export a singleton instance
export default new OrderController();
