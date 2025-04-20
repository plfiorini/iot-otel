import { type Meter, ValueType } from "@opentelemetry/api";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import * as opentelemetry from "@opentelemetry/api";

// Initialize meter provider
const meterProvider = new MeterProvider();
opentelemetry.metrics.setGlobalMeterProvider(meterProvider);

// Initialize meter
const meter: Meter = meterProvider.getMeter("http-metrics");

// Create metrics
export const requestCount = meter.createCounter("http_requests_total", {
	description: "Total number of HTTP requests",
	valueType: ValueType.INT,
});

export const requestDuration = meter.createHistogram(
	"http_request_duration_seconds",
	{
		description: "Duration of HTTP requests in seconds",
		valueType: ValueType.DOUBLE,
	},
);
export const requestSize = meter.createHistogram("http_request_size_bytes", {
	description: "Size of HTTP requests in bytes",
	valueType: ValueType.INT,
});

export const responseSize = meter.createHistogram("http_response_size_bytes", {
	description: "Size of HTTP responses in bytes",
	valueType: ValueType.INT,
});
