# Earnings Price Chart Builder

A modern, interactive web application to analyze stock price performance following earnings reports.

## Features

- **Interactive Visualizations**: Built with React and Recharts for smooth, detailed price analysis.
- **Real-time Data**: Powered by `yfinance` to fetch the latest historical prices.
- **Smart Logic**: Automatically identifies the nearest trading day for earnings reports.
- **Premium Design**: Dark-mode aesthetic with glassmorphism effects.
- **Key Statistics**: 
    - Post-earnings price performance percentage.
    - 1-day change analysis.
    - Price range (Min/Max) for the past year.

## Project Structure

- `backend/`: FastAPI server for data processing.
- `frontend/`: React + Vite application for the dashboard.
- `legacy-price-chart.py`: Original script for reference.

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js (installed during setup)

### How to Run

1. Open PowerShell in the root directory.
2. Run the start script:
   ```powershell
   .\start.ps1
   ```
3. Access the application at `http://localhost:5173`.

## Quality and Standards

- **Backend**: Linted with `ruff`, formatted with `black`, type-checked with `mypy`.
- **Frontend**: Built with TypeScript and React.
