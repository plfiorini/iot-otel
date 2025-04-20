import express from "express";
import { trace } from "@opentelemetry/api";

const router = express.Router();
const tracer = trace.getTracer("health-route");

// Route for /healthz
router.get("/healthz", (req, res) => {
	const span = tracer.startSpan("GET /healthz");
	try {
		res.status(200).json({ status: "ok" });
	} finally {
		span.end();
	}
});

// Route for /readyz
router.get("/readyz", (req, res) => {
	const span = tracer.startSpan("GET /readyz");
	try {
		res.status(200).json({ status: "ready" });
	} finally {
		span.end();
	}
});

export default router;
