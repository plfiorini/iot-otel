import Product from "../../models/product";
import { trace, SpanStatusCode, context } from "@opentelemetry/api";

interface ProductData {
	name: string;
	description?: string;
	price: number;
	stock: number;
}

// Create a tracer for the product service
const tracer = trace.getTracer("services.product");

class ProductService {
	/**
	 * Creates a new product in the database.
	 * @param productData - The data for the new product.
	 * @returns The created product instance.
	 */
	async createProduct(productData: ProductData): Promise<Product> {
		return tracer.startActiveSpan(
			"ProductService.createProduct",
			async (span) => {
				try {
					// Add product data as span attributes
					span.setAttribute("product.name", productData.name);
					span.setAttribute("product.price", productData.price);
					span.setAttribute("product.stock", productData.stock);

					// Basic validation
					if (
						!productData.name ||
						productData.price == null ||
						productData.stock == null
					) {
						throw new Error(
							"Missing required product fields: name, price, stock",
						);
					}
					if (productData.price <= 0) {
						throw new Error("Price must be positive");
					}
					if (productData.stock < 0) {
						throw new Error("Stock cannot be negative");
					}

					// Create a child span for the database operation
					return await tracer.startActiveSpan(
						"db.create_product",
						{
							// Explicitly set this as a child of the current span
							attributes: {
								"product.name": productData.name,
								"product.description": productData.description || "",
								"product.price": productData.price,
								"product.stock": productData.stock,
							},
						},
						async (dbSpan) => {
							try {
								const newProduct = await Product.create({
									...productData,
									description: productData.description || "", // Default description if not provided
								});
								console.log(`Product ${newProduct.name} created successfully.`);

								// Add the product ID to the span
								dbSpan.setAttribute("product.id", newProduct.id);
								dbSpan.setStatus({ code: SpanStatusCode.OK });
								dbSpan.end();

								span.setStatus({ code: SpanStatusCode.OK });
								return newProduct;
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
					console.error("Error creating product:", error);
					// Record the error in the span
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});

					// Re-throw the error or handle it as needed
					if (error instanceof Error) {
						throw new Error(`Failed to create product: ${error.message}`);
					}
					throw new Error("Failed to create product due to an unknown error.");
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * Retrieves a product by its ID.
	 * @param id - The ID of the product to retrieve.
	 * @returns The found product instance or null.
	 */
	async getProductById(id: number): Promise<Product | null> {
		return tracer.startActiveSpan(
			"ProductService.getProductById",
			async (span) => {
				try {
					span.setAttribute("product.id", id);

					const product = await Product.findByPk(id);

					if (product) {
						span.setAttribute("product.found", true);
					} else {
						span.setAttribute("product.found", false);
					}

					span.setStatus({ code: SpanStatusCode.OK });
					return product;
				} catch (error) {
					console.error(`Error retrieving product with ID ${id}:`, error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					throw new Error("Failed to retrieve product.");
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * Retrieves all products.
	 * @returns An array of all product instances.
	 */
	async getAllProducts(): Promise<Product[]> {
		return tracer.startActiveSpan(
			"ProductService.getAllProducts",
			async (span) => {
				try {
					const products = await Product.findAll();
					span.setAttribute("products.count", products.length);
					span.setStatus({ code: SpanStatusCode.OK });
					return products;
				} catch (error) {
					console.error("Error retrieving all products:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					throw new Error("Failed to retrieve products.");
				} finally {
					span.end();
				}
			},
		);
	}
}

// Export a singleton instance
export default new ProductService();
