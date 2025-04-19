import { DataTypes, Model, type Optional } from "sequelize";
import sequelize from "../db/sequelize";

// Interface for Product attributes
interface ProductAttributes {
	id: number;
	name: string;
	description: string;
	price: number;
	stock: number;
}

// Interface for Product creation attributes (id is optional)
interface ProductCreationAttributes extends Optional<ProductAttributes, "id"> {}

// Define the Product model
class Product
	extends Model<ProductAttributes, ProductCreationAttributes>
	implements ProductAttributes
{
	public id!: number;
	public name!: string;
	public description!: string;
	public price!: number;
	public stock!: number;

	// Timestamps
	public readonly createdAt!: Date;
	public readonly updatedAt!: Date;
}

// Initialize the Product model
Product.init(
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		description: {
			type: DataTypes.TEXT,
			allowNull: true,
		},
		price: {
			type: DataTypes.FLOAT,
			allowNull: false,
		},
		stock: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: "products", // Explicitly define the table name
		timestamps: true, // Enable timestamps (createdAt, updatedAt)
	},
);

export default Product;
