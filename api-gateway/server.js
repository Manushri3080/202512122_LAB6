const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

const PORT = process.env.GATEWAY_PORT || 3000;

const normalizeUrl = (url, fallback) => {
    let target = (url || fallback).trim();
    if (!target.startsWith("http://") && !target.startsWith("https://")) {
        target = `http://${target}`;
    }
    return target;
};

const USER_SERVICE_URL = normalizeUrl(process.env.USER_SERVICE_URL, "http://localhost:3001");
const PRODUCT_SERVICE_URL = normalizeUrl(process.env.PRODUCT_SERVICE_URL, "http://localhost:3002");
const ORDER_SERVICE_URL = normalizeUrl(process.env.ORDER_SERVICE_URL, "http://localhost:3003");


// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/health", (req, res) => {
    res.status(200).json({
        status: "UP",
        service: "api-gateway"
    });
});


// =====================================================
// LOGGING
// =====================================================

app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        console.log(
            `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`
        );
    });

    next();
});


// =====================================================
// PROXY ERROR HANDLER
// =====================================================

const proxyErrorHandler = (err, req, res) => {
    console.error("Gateway proxy error:", err.message);

    if (!res.headersSent) {
        res.status(503).json({
            error: "Service Unavailable",
            message: "Target service is currently unavailable"
        });
    }
};


// =====================================================
// USER SERVICE
// =====================================================

app.use(
    createProxyMiddleware({
        target: USER_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/users",
        on: {
            error: proxyErrorHandler
        }
    })
);


// =====================================================
// PRODUCT SERVICE
// =====================================================

app.use(
    createProxyMiddleware({
        target: PRODUCT_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/products",
        on: {
            error: proxyErrorHandler
        }
    })
);


// =====================================================
// ORDER SERVICE
// =====================================================

app.use(
    createProxyMiddleware({
        target: ORDER_SERVICE_URL,
        changeOrigin: true,
        pathFilter: "/orders",
        on: {
            error: proxyErrorHandler
        }
    })
);


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).json({
        error: "Not Found",
        message: `No gateway route for ${req.method} ${req.originalUrl}`
    });
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`API Gateway running on port ${PORT}`);
    console.log(`User Service: ${USER_SERVICE_URL}`);
    console.log(`Product Service: ${PRODUCT_SERVICE_URL}`);
    console.log(`Order Service: ${ORDER_SERVICE_URL}`);
});