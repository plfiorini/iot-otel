import Order from "../../models/order";
import Product from "../../models/product";

interface OrderData {
	orderId: string;
	productId: number;
	quantity: number;
	status?: "pending" | "processing" | "completed" | "cancelled";
}

class OrderService {
	/**
	 * Ingests a new order into the database.
	 * @param orderData - The data for the new order.
	 * @returns The created order instance.
	 */
	async ingestOrder(orderData: OrderData): Promise<Order> {
		try {
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

			// Ensure the product exists
			const product = await Product.findByPk(orderData.productId);
			if (!product) {
				throw new Error(
					`Product with ID ${orderData.productId} does not exist.`,
				);
			}

			const newOrder = await Order.create({
				...orderData,
				status: orderData.status || "pending", // Default status if not provided
			});
			console.log(`Order ${newOrder.orderId} ingested successfully.`);
			return newOrder;
		} catch (error) {
			console.error("Error ingesting order:", error);
			// Re-throw the error or handle it as needed (e.g., return null, throw custom error)
			if (error instanceof Error) {
				throw new Error(`Failed to ingest order: ${error.message}`);
			}
			throw new Error("Failed to ingest order due to an unknown error.");
		}
	}

	/**
	 * Retrieves an order by its ID.
	 * @param id - The ID of the order to retrieve.
	 * @returns The found order instance or null.
	 */
	async getOrderById(id: number): Promise<Order | null> {
		try {
			const order = await Order.findByPk(id);
			return order;
		} catch (error) {
			console.error(`Error retrieving order with ID ${id}:`, error);
			throw new Error("Failed to retrieve order.");
		}
	}

	/**
	 * Retrieves all orders.
	 * @returns An array of all order instances.
	 */
	async getAllOrders(): Promise<Order[]> {
		try {
			const orders = await Order.findAll();
			return orders;
		} catch (error) {
			console.error("Error retrieving all orders:", error);
			throw new Error("Failed to retrieve orders.");
		}
	}
}

// Export a singleton instance
export default new OrderService();
