# Lab 8 Traffic Generator Script
param(
    [int]$Count = 10,
    [string]$GatewayUrl = "http://localhost:3000"
)

Write-Host "=== Generating API Traffic to Gateway ($GatewayUrl) ===" -ForegroundColor Cyan

for ($i = 1; $i -le $Count; $i++) {
    Write-Host "`n--- Iteration $i of $Count ---" -ForegroundColor Yellow

    # Normal GET /health
    try {
        $res = Invoke-RestMethod -Uri "$GatewayUrl/health" -Method Get
        Write-Host " [GET /health] Status: OK | Service: $($res.service)" -ForegroundColor Green
    } catch {
        Write-Host " [GET /health] Failed: $_" -ForegroundColor Red
    }

    # Normal GET /users
    try {
        $users = Invoke-RestMethod -Uri "$GatewayUrl/users" -Method Get
        Write-Host " [GET /users] Status: OK | Users retrieved: $($users.Count)" -ForegroundColor Green
    } catch {
        Write-Host " [GET /users] Failed: $_" -ForegroundColor Red
    }

    # Normal GET /products
    try {
        $products = Invoke-RestMethod -Uri "$GatewayUrl/products" -Method Get
        Write-Host " [GET /products] Status: OK | Products retrieved: $($products.Count)" -ForegroundColor Green
    } catch {
        Write-Host " [GET /products] Failed: $_" -ForegroundColor Red
    }

    # Normal GET /orders
    try {
        $orders = Invoke-RestMethod -Uri "$GatewayUrl/orders" -Method Get
        Write-Host " [GET /orders] Status: OK | Orders retrieved: $($orders.Count)" -ForegroundColor Green
    } catch {
        Write-Host " [GET /orders] Failed: $_" -ForegroundColor Red
    }

    # Controlled Invalid Request (404 Not Found)
    try {
        $null = Invoke-RestMethod -Uri "$GatewayUrl/unknown-route" -Method Get
    } catch {
        Write-Host " [Controlled 404] Captured expected error: 404 Not Found" -ForegroundColor Magenta
    }

    Start-Sleep -Milliseconds 300
}

Write-Host "`nTraffic generation complete! Querying updated Prometheus metrics..." -ForegroundColor Cyan
