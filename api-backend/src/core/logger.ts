import pino from "pino";
import * as pkg from "../../package.json";

function getTransportTargets(): pino.TransportTargetOptions[] {
	const targets: pino.TransportTargetOptions[] = [
		{
			target: "pino-pretty",
			options: {
				colorize: true,
				translateTime: "SYS:standard",
				ignore: "pid,hostname",
			},
		},
	];
	if (process.env.PINO_LOKI_TRANSPORT) {
		targets.push({
			target: "pino-loki",
			options: {
				batching: true,
				interval: 5,
				host: process.env.LOKI_HOST,
				labels: {
					app: pkg.name,
					service_name: pkg.name,
					service_version: pkg.version,
					env: process.env.NODE_ENV || "development",
				},
			},
		});
	}
	return targets;
}

const logger = pino({
	level: process.env.LOG_LEVEL || "info",
	transport: {
		targets: getTransportTargets(),
	},
});

export default logger;
