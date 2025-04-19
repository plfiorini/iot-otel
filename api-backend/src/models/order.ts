import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/sequelize";
import Product from "./product";

// Interface for Order attributes
interface OrderAttributes {
	id: number;
	orderId: string;
	productId: number;
	quantity: number;
	status: "pending" | "processing" | "completed" | "cancelled";
}

// Interface for Order creation attributes (id is optional)
interface OrderCreationAttributes extends Optional<OrderAttributes, "id"> {}

// Define the Order model
class Order
	extends Model<OrderAttributes, OrderCreationAttributes>
	implements OrderAttributes
{
	public id!: number;
	public orderId!: string;
	public productId!: number;
	public quantity!: number;
	public status!: "pending" | "processing" | "completed" | "cancelled";

	// Timestamps
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;
}

// Initialize the Order model
Order.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		orderId: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		productId: {
			type: DataTypes.INTEGER,
			allowNull: false,
			references: {
				model: Product,
				key: "id",
			},
		},
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		status: {
			type: DataTypes.ENUM("pending", "processing", "completed", "cancelled"),
			allowNull: false,
			defaultValue: "pending",
		},
	},
	{
		sequelize,
		tableName: "orders", // Explicitly define the table name
		timestamps: true, // Enable timestamps (createdAt, updatedAt)
	},
);

// Setup associations
Order.belongsTo(Product, { foreignKey: "productId" });
Product.hasMany(Order, { foreignKey: "productId" });

export default Order;
