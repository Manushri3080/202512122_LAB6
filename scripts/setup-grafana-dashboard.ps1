# Script to create Lab 8 Grafana Dashboard
$dashboard = @{
    dashboard = @{
        id = $null
        title = "Lab 8 - CampusConnect Microservices Monitoring"
        tags = @("lab8", "kubernetes", "prometheus")
        timezone = "browser"
        schemaVersion = 16
        version = 1
        refresh = "5s"
        panels = @(
            @{
                title = "Service Availability (Target UP)"
                type = "stat"
                gridPos = @{ x = 0; y = 0; w = 12; h = 6 }
                targets = @(
                    @{
                        expr = "up"
                        legendFormat = "{{app}} ({{instance}})"
                        refId = "A"
                    }
                )
            },
            @{
                title = "Total Requests by Status & Route"
                type = "stat"
                gridPos = @{ x = 12; y = 0; w = 12; h = 6 }
                targets = @(
                    @{
                        expr = "sum by (status, route) (http_requests_total)"
                        legendFormat = "{{route}} [{{status}}]"
                        refId = "B"
                    }
                )
            },
            @{
                title = "HTTP Request Rate (req/sec)"
                type = "timeseries"
                gridPos = @{ x = 0; y = 6; w = 12; h = 8 }
                targets = @(
                    @{
                        expr = "sum by (route) (rate(http_requests_total[1m]))"
                        legendFormat = "{{route}}"
                        refId = "C"
                    }
                )
            },
            @{
                title = "HTTP Error Distribution (4xx & 5xx)"
                type = "timeseries"
                gridPos = @{ x = 12; y = 6; w = 12; h = 8 }
                targets = @(
                    @{
                        expr = "sum by (status) (http_requests_total{status=~'4..|5..'})"
                        legendFormat = "Status {{status}}"
                        refId = "D"
                    }
                )
            }
        )
    }
    overwrite = $true
} | ConvertTo-Json -Depth 10

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/db" -Method Post -Body $dashboard -Headers $headers
Write-Host "Grafana Dashboard Created: $($response.url)" -ForegroundColor Green
