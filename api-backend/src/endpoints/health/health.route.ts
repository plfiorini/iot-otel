import express from "express";

const router = express.Router();

// Route for /healthz
router.get("/healthz", (req, res) => {
	res.status(200).json({ status: "ok" });
});

// Route for /readyz
router.get("/readyz", (req, res) => {
	res.status(200).json({ status: "ready" });
});

export default router;
