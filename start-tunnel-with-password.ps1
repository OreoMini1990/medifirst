# Tunnel with password protection
# Usage: .\start-tunnel-with-password.ps1

param(
    [string]$Password = ""
)

Write-Host "Creating tunnel to localhost:3000..." -ForegroundColor Green

if ($Password) {
    Write-Host "Password protected tunnel" -ForegroundColor Yellow
    $env:LT_PASSWORD = $Password
    lt --port 3000
} else {
    Write-Host "No password (public access)" -ForegroundColor Cyan
    Write-Host "To set password, use: .\start-tunnel-with-password.ps1 -Password 'your-password'" -ForegroundColor Yellow
    Write-Host ""
    lt --port 3000
}

