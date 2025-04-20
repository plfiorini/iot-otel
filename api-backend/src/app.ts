import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import pinoHttp from "pino-http";
import orderRoutes from "./endpoints/order/order.route"; // Import order routes
import { initDb } from "./db/sequelize"; // Import DB initializer
import logger from "./core/logger";
import { httpMetricsMiddleware } from "./middlewares/httpMetrics";

const httpLogger = pinoHttp({ logger: logger.child({ name: "http" }) });
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(httpLogger);
app.use(cors());
app.use(bodyParser.json());
app.use(httpMetricsMiddleware);

// Routes
app.use("/orders", orderRoutes);

// Function to start the server
const startServer = async () => {
	try {
		// Initialize database connection and sync models
		await initDb();

		// Start the server
		app.listen(PORT, () => {
			logger.info(`Server is running on http://localhost:${PORT}`);
		});
	} catch (error) {
		logger.error("Failed to start server:", error);
		process.exit(1); // Exit if server fails to start
	}
};

// Start the server
startServer();
