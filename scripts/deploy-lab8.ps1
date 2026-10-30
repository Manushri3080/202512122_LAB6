# Lab 8 Kubernetes Deployment Helper Script
Write-Host "=== Deploying Lab 8 on Kubernetes ===" -ForegroundColor Cyan

# 1. Ensure lab8 namespace exists
kubectl create namespace lab8 --dry-run=client -o yaml | kubectl apply -f -

# 2. Apply ConfigMap and Secret
Write-Host "`n[1/3] Applying ConfigMap and Secret..." -ForegroundColor Yellow
kubectl apply -f k8s/configmap.yaml -n lab8
kubectl apply -f k8s/secret.yaml -n lab8

# 3. Apply Microservice Deployments and Services
Write-Host "`n[2/3] Applying Microservice Deployments and Services..." -ForegroundColor Yellow
kubectl apply -f k8s/user-deployment.yaml -n lab8
kubectl apply -f k8s/user-service.yaml -n lab8
kubectl apply -f k8s/product-deployment.yaml -n lab8
kubectl apply -f k8s/product-service.yaml -n lab8
kubectl apply -f k8s/order-deployment.yaml -n lab8
kubectl apply -f k8s/order-service.yaml -n lab8
kubectl apply -f k8s/gateway-deployment.yaml -n lab8
kubectl apply -f k8s/gateway-service.yaml -n lab8

# 4. Apply Prometheus and Grafana Monitoring
Write-Host "`n[3/3] Applying Prometheus and Grafana Monitoring..." -ForegroundColor Yellow
kubectl apply -f k8s/monitoring/prometheus-config.yaml -n lab8
kubectl apply -f k8s/monitoring/prometheus.yaml -n lab8
kubectl apply -f k8s/monitoring/grafana.yaml -n lab8

Write-Host "`nDeployment completed. Checking resources in namespace 'lab8':" -ForegroundColor Green
kubectl get deployments,pods,services -n lab8
