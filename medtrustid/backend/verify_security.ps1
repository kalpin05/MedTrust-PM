$serverProcess = Start-Process -FilePath "node" -ArgumentList "server.js" -PassThru -NoNewWindow
Write-Host "Server started with PID: $($serverProcess.Id)"
Start-Sleep -Seconds 10

Write-Host "Running simulation..."
node simulate_attack.js

Stop-Process -Id $serverProcess.Id
Write-Host "Server stopped."
