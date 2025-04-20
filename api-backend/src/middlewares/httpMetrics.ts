import type { Request, Response, NextFunction } from "express";
import * as httpMetrics from "../metrics/http";

export function httpMetricsMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const start = process.hrtime();
	const requestSize = Number.parseInt(req.headers["content-length"] || "0", 10);

	res.on("finish", () => {
		const [seconds, nanoseconds] = process.hrtime(start);
		const durationInSeconds = seconds + nanoseconds / 1e9;
		const responseSize = Number.parseInt(
			(res.getHeader("content-length") as string) || "0",
			10,
		);

		httpMetrics.requestCount.add(1, {
			method: req.method,
			route: req.path,
			status_code: res.statusCode.toString(),
		});

		httpMetrics.requestDuration.record(durationInSeconds, {
			method: req.method,
			route: req.path,
			status_code: res.statusCode.toString(),
		});

		httpMetrics.requestSize.record(requestSize, {
			method: req.method,
			route: req.path,
		});

		httpMetrics.responseSize.record(responseSize, {
			method: req.method,
			route: req.path,
			status_code: res.statusCode.toString(),
		});
	});

	next();
}
