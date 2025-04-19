import { Sequelize } from "sequelize";
import baseLogger from "../core/logger";

const logger = baseLogger.child({ name: "sequelize" });

// Initialize Sequelize with an in-memory SQLite database
const sequelize = new Sequelize({
	dialect: "sqlite",
	storage: ":memory:",
	logging: (msg) => logger.trace(msg),
});

// Function to initialize the database connection and sync models
export async function initDb() {
	try {
		await sequelize.authenticate();
		console.log("Connection has been established successfully.");
		// Sync all defined models to the DB.
		// Use { force: true } to drop and recreate tables on every restart (for development)
		// await sequelize.sync({ force: true });
		await sequelize.sync();
		console.log("Database synchronized.");
	} catch (error) {
		console.error("Unable to connect to the database:", error);
		// Exit the process if the database connection fails
		process.exit(1);
	}
}

export default sequelize;
