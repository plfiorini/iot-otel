import Order from "../../models/order";
import Product from "../../models/product";
import { trace, SpanStatusCode } from "@opentelemetry/api";

interface OrderData {
	orderId: string;
	productId: number;
	quantity: number;
	status?: "pending" | "processing" | "completed" | "cancelled";
}

// Create a tracer for the order service
const tracer = trace.getTracer("services.order");

class OrderService {
	/**
	 * Ingests a new order into the database.
	 * @param orderData - The data for the new order.
	 * @returns The created order instance.
	 */
	async ingestOrder(orderData: OrderData): Promise<Order> {
		return tracer.startActiveSpan("OrderService.ingestOrder", async (span) => {
			try {
				// Add order data as span attributes
				span.setAttribute("order.id", orderData.orderId);
				span.setAttribute("order.product_id", orderData.productId);
				span.setAttribute("order.quantity", orderData.quantity);

				// Basic validation could be added here before creation
				if (
					!orderData.orderId ||
					!orderData.productId ||
					orderData.quantity == null
				) {
					throw new Error(
						"Missing required order fields: orderId, productId, quantity",
					);
				}
				if (orderData.quantity <= 0) {
					throw new Error("Quantity must be positive");
				}

				// Create child span for product verification
				const productVerificationSpan = tracer.startSpan("verify_product");
				productVerificationSpan.setAttribute("product.id", orderData.productId);

				try {
					// Ensure the product exists
					const product = await Product.findByPk(orderData.productId);
					if (!product) {
						throw new Error(
							`Product with ID ${orderData.productId} does not exist.`,
						);
					}
					productVerificationSpan.setAttribute("product.exists", true);
					productVerificationSpan.setStatus({ code: SpanStatusCode.OK });
				} catch (error) {
					productVerificationSpan.setAttribute("product.exists", false);
					productVerificationSpan.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					throw error;
				} finally {
					productVerificationSpan.end();
				}

				// Create child span for order creation
				return await tracer.startActiveSpan(
					"db.create_order",
					async (dbSpan) => {
						try {
							const newOrder = await Order.create({
								...orderData,
								status: orderData.status || "pending", // Default status if not provided
							});
							console.log(`Order ${newOrder.orderId} ingested successfully.`);

							// Add the order database ID to the span
							dbSpan.setAttribute("order.db_id", newOrder.id);
							dbSpan.setAttribute("order.status", newOrder.status);
							dbSpan.setStatus({ code: SpanStatusCode.OK });
							dbSpan.end();

							span.setStatus({ code: SpanStatusCode.OK });
							return newOrder;
						} catch (error) {
							dbSpan.setStatus({
								code: SpanStatusCode.ERROR,
								message:
									error instanceof Error ? error.message : "Unknown error",
							});
							dbSpan.end();
							throw error;
						}
					},
				);
			} catch (error) {
				console.error("Error ingesting order:", error);
				// Record the error in the span
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: error instanceof Error ? error.message : "Unknown error",
				});

				// Re-throw the error or handle it as needed
				if (error instanceof Error) {
					throw new Error(`Failed to ingest order: ${error.message}`);
				}
				throw new Error("Failed to ingest order due to an unknown error.");
			} finally {
				span.end();
			}
		});
	}

	/**
	 * Retrieves an order by its ID.
	 * @param id - The ID of the order to retrieve.
	 * @returns The found order instance or null.
	 */
	async getOrderById(id: number): Promise<Order | null> {
		return tracer.startActiveSpan("OrderService.getOrderById", async (span) => {
			try {
				span.setAttribute("order.db_id", id);

				const order = await Order.findByPk(id);

				if (order) {
					span.setAttribute("order.found", true);
					span.setAttribute("order.order_id", order.orderId);
					span.setAttribute("order.status", order.status);
				} else {
					span.setAttribute("order.found", false);
				}

				span.setStatus({ code: SpanStatusCode.OK });
				return order;
			} catch (error) {
				console.error(`Error retrieving order with ID ${id}:`, error);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: error instanceof Error ? error.message : "Unknown error",
				});
				throw new Error("Failed to retrieve order.");
			} finally {
				span.end();
			}
		});
	}

	/**
	 * Retrieves all orders.
	 * @returns An array of all order instances.
	 */
	async getAllOrders(): Promise<Order[]> {
		return tracer.startActiveSpan("OrderService.getAllOrders", async (span) => {
			try {
				const orders = await Order.findAll();
				span.setAttribute("orders.count", orders.length);
				span.setStatus({ code: SpanStatusCode.OK });
				return orders;
			} catch (error) {
				console.error("Error retrieving all orders:", error);
				span.setStatus({
					code: SpanStatusCode.ERROR,
					message: error instanceof Error ? error.message : "Unknown error",
				});
				throw new Error("Failed to retrieve orders.");
			} finally {
				span.end();
			}
		});
	}
}

// Export a singleton instance
export default new OrderService();
