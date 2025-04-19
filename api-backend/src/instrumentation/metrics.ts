import { metrics } from "@opentelemetry/api";

// Create a meter provider
const meter = metrics.getMeter("iot-metrics");

// Define counters and gauges for IoT metrics
const deviceCounter = meter.createCounter("iot.devices.total", {
	description: "Total number of registered devices",
});

const telemetryCounter = meter.createCounter("iot.telemetry.received", {
	description: "Count of telemetry messages received",
});

const deviceStatusGauge = meter.createObservableGauge("iot.devices.status", {
	description: "Current status of devices by type",
});

// Export metrics utilities
export const iotMetrics = {
	recordDeviceCreation: (deviceType: string) => {
		deviceCounter.add(1, { deviceType });
	},

	recordTelemetryReceived: (deviceType: string, messageType: string) => {
		telemetryCounter.add(1, { deviceType, messageType });
	},

	// Add more metric recording functions as needed
};

export default iotMetrics;
