# Simple tunnel script - Run this after starting dev server manually
# Usage: 
#   1. Open terminal 1: npm run dev
#   2. Open terminal 2: .\start-tunnel-simple.ps1

Write-Host "Creating tunnel to localhost:3000..." -ForegroundColor Green
Write-Host "Your external URL will be shown below:" -ForegroundColor Cyan
Write-Host ""

lt --port 3000

