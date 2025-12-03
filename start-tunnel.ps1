# MediFirst Temporary Deployment Script
# Using localtunnel to expose local dev server

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "Starting MediFirst temporary deployment..." -ForegroundColor Green

# Check if localtunnel is installed
$ltInstalled = Get-Command lt -ErrorAction SilentlyContinue
if (-not $ltInstalled) {
    Write-Host "Installing localtunnel..." -ForegroundColor Yellow
    npm install -g localtunnel
}

# Start dev server in background
Write-Host "Starting dev server..." -ForegroundColor Cyan
$devServer = Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -PassThru

# Wait for server to start
Write-Host "Waiting for server to start (5 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Create tunnel
Write-Host "Creating external access tunnel..." -ForegroundColor Cyan
Write-Host "Once tunnel URL is generated, you can access from external." -ForegroundColor Green
Write-Host "Press Ctrl+C to stop tunnel and dev server" -ForegroundColor Yellow
Write-Host ""

lt --port 3000

# Cleanup on exit
Write-Host "Stopping tunnel and dev server..." -ForegroundColor Yellow
Stop-Process -Id $devServer.Id -Force -ErrorAction SilentlyContinue

