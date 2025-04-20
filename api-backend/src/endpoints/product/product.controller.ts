import type { Request, Response } from "express";
import ProductService from "./product.service";
import { trace, SpanStatusCode } from "@opentelemetry/api";

// Create a tracer for this module
const tracer = trace.getTracer("endpoints.product");

class ProductController {
	/**
	 * Handles the creation of a new product.
	 */
	async createProduct(req: Request, res: Response): Promise<void> {
		// Create a span for this operation
		return tracer.startActiveSpan(
			"ProductController.createProduct",
			async (span) => {
				try {
					const productData = req.body;
					span.setAttribute("product.data", JSON.stringify(productData));

					// Add validation for the request body
					if (!productData || typeof productData !== "object") {
						span.setStatus({
							code: SpanStatusCode.ERROR,
							message: "Invalid request body",
						});
						res.status(400).json({ message: "Invalid request body" });
						return;
					}

					const newProduct = await ProductService.createProduct(productData);
					span.setAttribute("product.id", newProduct.id || "unknown");
					span.setStatus({ code: SpanStatusCode.OK });
					res.status(201).json(newProduct);
				} catch (error) {
					console.error("Error in ProductController.createProduct:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					span.recordException(error as Error);

					if (error instanceof Error) {
						// Check for specific validation errors from the service
						if (
							error.message.includes("Missing required product fields") ||
							error.message.includes("Price must be positive") ||
							error.message.includes("Stock cannot be negative")
						) {
							res.status(400).json({ message: error.message });
						} else if (error.message.includes("Failed to create product")) {
							res.status(409).json({
								message:
									"Failed to create product. It might already exist or there was a conflict.",
							});
						} else {
							res.status(500).json({
								message: "Internal server error while creating product",
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
	 * Handles retrieving a single product by ID.
	 */
	async getProduct(req: Request, res: Response): Promise<void> {
		return tracer.startActiveSpan(
			"ProductController.getProduct",
			async (span) => {
				try {
					const id = Number.parseInt(req.params.id, 10);
					span.setAttribute("product.id", id);

					if (Number.isNaN(id)) {
						span.setStatus({
							code: SpanStatusCode.ERROR,
							message: "Invalid product ID format",
						});
						res.status(400).json({ message: "Invalid product ID format" });
						return;
					}

					const product = await ProductService.getProductById(id);
					if (product) {
						res.status(200).json(product);
					} else {
						span.setAttribute("product.found", false);
						res.status(404).json({ message: "Product not found" });
					}
				} catch (error) {
					console.error("Error in ProductController.getProduct:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					span.recordException(error as Error);
					res.status(500).json({
						message: "Internal server error while retrieving product",
					});
				} finally {
					span.end();
				}
			},
		);
	}

	/**
	 * Handles retrieving all products.
	 */
	async getAllProducts(req: Request, res: Response): Promise<void> {
		return tracer.startActiveSpan(
			"ProductController.getAllProducts",
			async (span) => {
				try {
					const products = await ProductService.getAllProducts();
					span.setAttribute("products.count", products.length);
					res.status(200).json(products);
				} catch (error) {
					console.error("Error in ProductController.getAllProducts:", error);
					span.setStatus({
						code: SpanStatusCode.ERROR,
						message: error instanceof Error ? error.message : "Unknown error",
					});
					span.recordException(error as Error);
					res.status(500).json({
						message: "Internal server error while retrieving products",
					});
				} finally {
					span.end();
				}
			},
		);
	}
}

// Export a singleton instance
export default new ProductController();
