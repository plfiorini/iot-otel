import Pyroscope from "@pyroscope/nodejs";

Pyroscope.init({
	appName: "api-backend",
	// Enable CPU time collection for wall profiles
	// This is required for CPU profiling functionality
	wall: {
		collectCpuTime: true,
	},
});

Pyroscope.start();
