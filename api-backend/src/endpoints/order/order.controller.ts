import type { Request, Response } from "express";
import OrderService from "./order.service";
import { trace, SpanStatusCode } from "@opentelemetry/api";

// Create a tracer for this module
const tracer = trace.getTracer("order-controller");

class OrderController {
	/**
	 * Handles the creation of a new order.
	 */
	async createOrder(req: Request, res: Response): Promise<void> {
		// Create a span for this operation
		return tracer.startActiveSpan(
			"OrderController.createOrder",
			async (span) => {
				try {
					const orderData = req.body;
					span.setAttribute("order.data", JSON.stringify(orderData));

					// Add more robust validation here (e.g., using a library like Zod or Joi)
					if (!orderData || typeof orderData !== "object") {
						span.setStatus({
							code: SpanStatusCode.ERROR,
							message: "Invalid request body",
						});
						res.status(400).json({ message: "Invalid request body" });
						return;
					}

					const newOrder = await OrderService.ingestOrder(orderData);
					span.setAttribute("order.id", newOrder.id || "unknown");
					res.status(201).json(newOrder);
				} catch (error) {
					console.error("Error in OrderController.createOrder:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					span.recordException(error as Error);

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
							res.status(500).json({
								message: "Internal server error while creating order",
							});
						}
					} else {
						res.status(500).json({ message: "An unknown error occurred" });
					}
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * Handles retrieving a single order by ID.
	 */
	async getOrder(req: Request, res: Response): Promise<void> {
		return tracer.startActiveSpan("OrderController.getOrder", async (span) => {
			try {
				const id = Number.parseInt(req.params.id, 10); // Use Number.parseInt
				span.setAttribute("order.id", id);

				if (Number.isNaN(id)) {
					// Use Number.isNaN
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: "Invalid order ID format",
					});
					res.status(400).json({ message: "Invalid order ID format" });
					return;
				}

				const order = await OrderService.getOrderById(id);
				if (order) {
					res.status(200).json(order);
				} else {
					span.setAttribute("order.found", false);
					res.status(404).json({ message: "Order not found" });
				}
			} catch (error) {
				console.error("Error in OrderController.getOrder:", error);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: error instanceof Error ? error.message : "Unknown error",
				});
				span.recordException(error as Error);
				res
					.status(500)
					.json({ message: "Internal server error while retrieving order" });
			} finally {
				span.end();
			}
		});
	}

	/**
	 * Handles retrieving all orders.
	 */
	async getAllOrders(req: Request, res: Response): Promise<void> {
		return tracer.startActiveSpan(
			"OrderController.getAllOrders",
			async (span) => {
				try {
					const orders = await OrderService.getAllOrders();
					span.setAttribute("orders.count", orders.length);
					res.status(200).json(orders);
				} catch (error) {
					console.error("Error in OrderController.getAllOrders:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					span.recordException(error as Error);
					res
						.status(500)
						.json({ message: "Internal server error while retrieving orders" });
				} finally {
					span.end();
				}
			},
		);
	}
}

// Export a singleton instance
export default new OrderController();
