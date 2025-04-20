import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ATTR_SERVICE_NAME,
	ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import * as pkg from "../package.json";

// For troubleshooting, set the log level to DiagLogLevel.DEBUG
diag.setLogger(
	new DiagConsoleLogger(),
	process.env.OTEL_DEBUG ? DiagLogLevel.DEBUG : DiagLogLevel.INFO,
);

// Create the SDK with updated resource pattern
const sdk = new NodeSDK({
	resource: resourceFromAttributes({
		[ATTR_SERVICE_NAME]: pkg.name,
		[ATTR_SERVICE_VERSION]: pkg.version,
	}),
	traceExporter: new OTLPTraceExporter(),
	metricReader: new PrometheusExporter({
		port: 9464,
		endpoint: "/metrics",
		preventServerStart: false,
	}),
	instrumentations: [
		getNodeAutoInstrumentations({
			// Enable pino instrumentation when LOKI_HOST is not defined
			"@opentelemetry/instrumentation-pino": {
				enabled: !process.env.LOKI_HOST,
			},
		}),
	],
});

// Initialize the SDK and register with the OpenTelemetry API
sdk.start();
console.log("OpenTelemetry initialized");

// Gracefully shut down the SDK on process exit
process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

function gracefulShutdown() {
	console.log("Shutting down OpenTelemetry...");
	sdk
		.shutdown()
		.then(() => console.log("OpenTelemetry terminated successfully"))
		.catch((error) => console.error("Error terminating OpenTelemetry", error))
		.finally(() => process.exit(0));
}

export default sdk;
