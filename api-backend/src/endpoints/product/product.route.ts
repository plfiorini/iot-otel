import Pyroscope from "@pyroscope/nodejs";
import { Router, type Request, type Response } from "express";
import ProductController from "./product.controller";

const router = Router();

// Route to create a new product
router.post("/", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await ProductController.createProduct(req, res);
		},
	);
});

// Route to get all products
router.get("/", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await ProductController.getAllProducts(req, res);
		},
	);
});

// Route to get a single product by ID
router.get("/:id", (req: Request, res: Response) => {
	Pyroscope.wrapWithLabels(
		{
			"http.route": req.route,
			"http.method": req.method,
			"http.path": req.url,
		},
		async () => {
			return await ProductController.getProduct(req, res);
		},
	);
});

export default router;
