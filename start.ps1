# Start Chart Builder

$env:PATH = "C:\Program Files\nodejs;" + $env:PATH

# Start Backend
Write-Host "Starting Backend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; .\venv\Scripts\Activate.ps1; python main.py"

# Start Frontend
Write-Host "Starting Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; `$env:PATH = 'C:\Program Files\nodejs;' + `$env:PATH; & 'C:\Program Files\nodejs\npm.cmd' run dev"

Write-Host "App will be available at http://localhost:5173" -ForegroundColor Cyan
