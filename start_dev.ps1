write-host "Starting Backend and Frontend..." -ForegroundColor Green

# Start Backend
Start-Process powershell -ArgumentList "cd backend; npm run dev" -NoNewWindow
write-host "Backend started on port 3005"

# Start Frontend
Start-Process powershell -ArgumentList "cd frontend; npm run dev" -NoNewWindow
write-host "Frontend started (usually port 5173)"
