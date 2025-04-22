import Pyroscope from "@pyroscope/nodejs";
import { Router, type Request, type Response } from "express";
import OrderController from "./order.controller";

const router = Router();

// Route to create a new order
router.post("/", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await OrderController.createOrder(req, res);
		},
	);
});

// Route to get all orders
router.get("/", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await OrderController.getAllOrders(req, res);
		},
	);
});

// Route to get a single order by ID
router.get("/:id", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await OrderController.getOrder(req, res);
		},
	);
});

export default router;
