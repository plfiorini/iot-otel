// filepath: /workspaces/iot-otel/api-backend/src/endpoints/product/product.service.ts
import Product from "../../models/product";

interface ProductData {
	name: string;
	description?: string;
	price: number;
	stock: number;
}

class ProductService {
	/**
	 * Creates a new product in the database.
	 * @param productData - The data for the new product.
	 * @returns The created product instance.
	 */
	async createProduct(productData: ProductData): Promise<Product> {
		try {
			// Basic validation
			if (
				!productData.name ||
				productData.price == null ||
				productData.stock == null
			) {
				throw new Error("Missing required product fields: name, price, stock");
			}
			if (productData.price <= 0) {
				throw new Error("Price must be positive");
			}
			if (productData.stock < 0) {
				throw new Error("Stock cannot be negative");
			}

			const newProduct = await Product.create({
				...productData,
				description: productData.description || "", // Default description if not provided
			});
			console.log(`Product ${newProduct.name} created successfully.`);
			return newProduct;
		} catch (error) {
			console.error("Error creating product:", error);
			// Re-throw the error or handle it as needed
			if (error instanceof Error) {
				throw new Error(`Failed to create product: ${error.message}`);
			}
			throw new Error("Failed to create product due to an unknown error.");
		}
	}

	/**
	 * Retrieves a product by its ID.
	 * @param id - The ID of the product to retrieve.
	 * @returns The found product instance or null.
	 */
	async getProductById(id: number): Promise<Product | null> {
		try {
			const product = await Product.findByPk(id);
			return product;
		} catch (error) {
			console.error(`Error retrieving product with ID ${id}:`, error);
			throw new Error("Failed to retrieve product.");
		}
	}

	/**
	 * Retrieves all products.
	 * @returns An array of all product instances.
	 */
	async getAllProducts(): Promise<Product[]> {
		try {
			const products = await Product.findAll();
			return products;
		} catch (error) {
			console.error("Error retrieving all products:", error);
			throw new Error("Failed to retrieve products.");
		}
	}
}

// Export a singleton instance
export default new ProductService();
