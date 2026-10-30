const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
const client = require("prom-client");

const app = express();

// =====================================================
// PROMETHEUS METRICS SETUP
// =====================================================
client.collectDefaultMetrics({ prefix: "api_gateway_" });

const httpRequestCounter = new client.Counter({
    name: "http_requests_total",
    help: "Total number of HTTP requests processed by API Gateway",
    labelNames: ["method", "route", "status"]
});

const httpRequestDuration = new client.Histogram({
    name: "http_request_duration_seconds",
    help: "HTTP request latency in seconds",
    labelNames: ["method", "route", "status"],
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5]
});

// Enable CORS for web/client requests
app.use(cors());

const PORT = process.env.GATEWAY_PORT || 3000;

// URL normalizer helper
const normalizeUrl = (url, fallback) => {
    let target = (url || fallback).trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = `http://${target}`;
    }
    return target;
};

// =====================================================
// SERVICE DISCOVERY REGISTRY (Configuration-Based)
// =====================================================
const services = {
    userService: normalizeUrl(process.env.USER_SERVICE_URL, "http://localhost:3001"),
    productService: normalizeUrl(process.env.PRODUCT_SERVICE_URL, "http://localhost:3002"),
    orderService: normalizeUrl(process.env.ORDER_SERVICE_URL, "http://localhost:3003")
};

// Helper to identify the target service for logging
const resolveTargetService = (path) => {
    if (path.startsWith("/users")) return { name: "User Service", target: services.userService };
    if (path.startsWith("/products")) return { name: "Product Service", target: services.productService };
    if (path.startsWith("/orders")) return { name: "Order Service", target: services.orderService };
    if (path.startsWith("/health")) return { name: "API Gateway (Local Health)", target: "internal" };
    if (path.startsWith("/metrics")) return { name: "Prometheus Metrics", target: "internal" };
    return { name: "Unknown", target: "N/A" };
};

// =====================================================
// REQUEST LOGGING & METRICS COLLECTION
// =====================================================
app.use((req, res, next) => {
    const start = Date.now();
    const route = req.path || req.originalUrl.split("?")[0];
    const targetInfo = resolveTargetService(req.originalUrl);

    res.on("finish", () => {
        const durationMs = Date.now() - start;
        const durationSec = durationMs / 1000;
        console.log(
            `[GATEWAY LOG] Method: ${req.method} | Path: ${req.originalUrl} | Target Service: ${targetInfo.name} (${targetInfo.target}) | Status: ${res.statusCode} | Duration: ${durationMs}ms`
        );

        if (route !== "/metrics") {
            httpRequestCounter.inc({
                method: req.method,
                route: route,
                status: res.statusCode.toString()
            });
            httpRequestDuration.observe(
                {
                    method: req.method,
                    route: route,
                    status: res.statusCode.toString()
                },
                durationSec
            );
        }
    });

    next();
});

// =====================================================
// PROMETHEUS METRICS ENDPOINT
// =====================================================
app.get("/metrics", async (req, res) => {
    try {
        res.set("Content-Type", client.register.contentType);
        res.end(await client.register.metrics());
    } catch (err) {
        res.status(500).end(err);
    }
});

// =====================================================
// GATEWAY HEALTH CHECK
// =====================================================
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "api-gateway",
        timestamp: new Date().toISOString(),
        serviceRegistry: {
            userService: services.userService,
            productService: services.productService,
            orderService: services.orderService
        }
    });
});

// =====================================================
// CENTRALIZED PROXY ERROR HANDLER (502 / 503)
// =====================================================
const createProxyErrorHandler = (serviceName) => {
    return (err, req, res) => {
        console.error(`[GATEWAY ERROR] Downstream service unreachable [${serviceName}]:`, err.message);

        if (!res.headersSent) {
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({
                error: `${serviceName} unavailable`,
                message: `Target service [${serviceName}] is unreachable or currently down.`,
                statusCode: 503,
                timestamp: new Date().toISOString()
            }));
        }
    };
};

// =====================================================
// USER SERVICE REVERSE PROXY
// =====================================================
app.use(
    createProxyMiddleware({
        target: services.userService,
        changeOrigin: true,
        pathFilter: "/users",
        on: {
            error: createProxyErrorHandler("User Service")
        }
    })
);

// =====================================================
// PRODUCT SERVICE REVERSE PROXY
// =====================================================
app.use(
    createProxyMiddleware({
        target: services.productService,
        changeOrigin: true,
        pathFilter: "/products",
        on: {
            error: createProxyErrorHandler("Product Service")
        }
    })
);

// =====================================================
// ORDER SERVICE REVERSE PROXY
// =====================================================
app.use(
    createProxyMiddleware({
        target: services.orderService,
        changeOrigin: true,
        pathFilter: "/orders",
        on: {
            error: createProxyErrorHandler("Order Service")
        }
    })
);

// =====================================================
// 404 HANDLER FOR UNMAPPED ROUTES
// =====================================================
app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `No gateway route found for ${req.method} ${req.originalUrl}`
    });
});

// =====================================================
// START SERVER
// =====================================================
app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(` API Gateway running on port ${PORT}`);
    console.log(` Configured Service Registry:`);
    console.log(`   - User Service   : ${services.userService}`);
    console.log(`   - Product Service: ${services.productService}`);
    console.log(`   - Order Service  : ${services.orderService}`);
    console.log(`====================================================`);
});