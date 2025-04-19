# IoT OpenTelemetry Demo

This project demonstrates a simple Node.js backend application (`api-backend`) instrumented with OpenTelemetry for comprehensive observability (logs, metrics, traces) and Pyroscope for continuous profiling. The entire observability stack, including Prometheus, Loki, Tempo, Grafana, Pyroscope, and Grafana Alloy, is containerized and managed using Docker Compose.

## Features

*   **Node.js API Backend:** A simple Express-based API with endpoints for managing products and orders, using Sequelize with an in-memory SQLite database.
*   **OpenTelemetry Integration:**
    *   **Tracing:** Automatic and manual instrumentation using the OpenTelemetry SDK (`@opentelemetry/sdk-node`, `@opentelemetry/auto-instrumentations-node`). Traces are exported to Tempo via OTLP.
    *   **Metrics:** Custom HTTP metrics and automatic instrumentations metrics exported to Prometheus via a Prometheus exporter endpoint.
    *   **Logging:** Logs are collected using Pino and forwarded to Loki via Grafana Alloy using OTLP.
*   **Continuous Profiling:** Integrated with Pyroscope for CPU profiling.
*   **Observability Stack:** Pre-configured Docker Compose setup for:
    *   **Prometheus:** Metrics collection and storage.
    *   **Loki:** Log aggregation and storage.
    *   **Tempo:** Distributed tracing backend.
    *   **Grafana:** Visualization dashboard for logs, metrics, and traces.
    *   **Pyroscope:** Continuous profiling platform.
    *   **Grafana Alloy:** OpenTelemetry collector for logs.
*   **Dockerized:** Fully containerized for easy setup and deployment.
*   **Dev Container:** Includes a development container configuration for a consistent development environment.

## Technology Stack

*   **Backend:** Node.js, TypeScript, Express, Sequelize, SQLite
*   **Observability:**
    *   OpenTelemetry SDK
    *   Pino (Logging)
    *   Pyroscope (Profiling)
    *   Prometheus (Metrics)
    *   Loki (Logs)
    *   Tempo (Traces)
    *   Grafana (Visualization)
    *   Grafana Alloy (Log Collection)
*   **Containerization:** Docker, Docker Compose

## Getting Started

### Prerequisites

*   Docker: [Install Docker](https://docs.docker.com/get-docker/)
*   Docker Compose: Usually included with Docker Desktop. If not, [Install Docker Compose](https://docs.docker.com/compose/install/)

### Running the Project

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd iot-otel
    ```
2.  **Start the services:**
    Navigate to the `observability` directory and run Docker Compose:
    ```bash
    cd observability
    docker compose up -d --build
    ```
    This command will build the `api-backend` image and start all the services defined in `docker-compose.yaml`.

### Accessing Services

*   **Grafana:** [http://localhost:3000](http://localhost:3000)
    *   Datasources (Prometheus, Loki, Tempo, Pyroscope) are pre-configured.
*   **API Backend:** [http://localhost:8000](http://localhost:8000)
    *   Health Check: `GET /healthz`
    *   Metrics: `GET /metrics` (Internal endpoint scraped by Prometheus at `http://api-backend:9464/metrics`)
*   **Prometheus:** [http://localhost:9090](http://localhost:9090)
*   **Pyroscope:** [http://localhost:4040](http://localhost:4040)
*   **Tempo:** (Accessed via Grafana)
*   **Loki:** (Accessed via Grafana)
*   **Alloy UI:** [http://localhost:12345](http://localhost:12345)

### Generating Sample Data

A simple test script is provided to send sample requests to the API backend:

```bash
cd ../api-backend
./test 10 # Send 10 pairs of product/order requests
```

## Project Structure

```
.
├── api-backend/        # Node.js API service source code
│   ├── src/            # TypeScript source files
│   ├── Dockerfile      # Dockerfile for the API backend
│   ├── package.json
│   └── tsconfig.json
├── observability/      # Docker Compose and configuration for observability stack
│   ├── docker-compose.yaml
│   ├── prometheus.yaml
│   ├── loki.yaml
│   ├── tempo.yaml
│   ├── config.alloy
│   ├── grafana-datasources.yaml
│   └── ... (other config files)
├── .devcontainer/      # VS Code Development Container configuration
├── .vscode/            # VS Code workspace settings
├── LICENSE
└── README.md           # This file
```

## Observability Details

*   **Tracing:** The `api-backend/src/tracing.ts` file initializes the OpenTelemetry Node SDK. It uses auto-instrumentations for common libraries (HTTP, Express, etc.) and exports traces via OTLP HTTP to Tempo (`http://tempo:4318`). Manual tracing spans are added in controllers and services.
*   **Metrics:** The SDK is also configured with a Prometheus exporter (`api-backend/src/tracing.ts`), exposing metrics at `/metrics` on port `9464`. Custom HTTP metrics are defined in `api-backend/src/metrics/http.ts` and collected via middleware in `api-backend/src/middlewares/httpMetrics.ts`. Prometheus scrapes this endpoint.
*   **Logging:** The application uses Pino for logging (`api-backend/src/core/logger.ts`). Logs are sent via OTLP gRPC from the `api-backend` to Grafana Alloy (`http://alloy:4317`), which then forwards them to Loki. The OTLP log exporter configuration is within the `api-backend` service definition in `observability/docker-compose.yaml`. Alloy's configuration is in `observability/config.alloy`.
*   **Profiling:** Pyroscope is initialized in `api-backend/src/profiling.ts` and automatically profiles the Node.js application. Data is sent to the Pyroscope server (`http://pyroscope:4040`). Route handlers are wrapped using `Pyroscope.wrapWithLabels` to add context (`http.route`, `http.method`) to profiles.
*   **Grafana:** Provides dashboards to visualize metrics (from Prometheus), logs (from Loki), traces (from Tempo), and profiles (from Pyroscope). Datasources are automatically provisioned via `observability/grafana-datasources.yaml`.

## API Endpoints (`api-backend`)

*   `GET /healthz`: Health check endpoint.
*   `GET /readyz`: Readiness check endpoint.
*   `POST /products`: Create a new product.
    *   Body: `{ "name": "string", "description": "string", "price": number, "stock": number }`
*   `GET /products`: Get all products.
*   `GET /products/:id`: Get a product by ID.
*   `POST /orders`: Create a new order.
    *   Body: `{ "orderId": "string", "productId": number, "quantity": number, "status?": "string" }`
*   `GET /orders`: Get all orders.
*   `GET /orders/:id`: Get an order by ID.

## Development

This project includes a Dev Container configuration (`.devcontainer/devcontainer.json`). If you open this project in VS Code with the "Dev Containers" extension installed, you can develop inside a pre-configured container with Node.js, TypeScript, and other tools ready.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
