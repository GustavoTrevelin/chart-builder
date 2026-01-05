from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import List
import bisect

app = FastAPI()

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_nearest_trading_date(
    trading_dates: List[pd.Timestamp], target_date: datetime
) -> pd.Timestamp:
    target_ts = (
        pd.Timestamp(target_date).tz_localize(trading_dates[0].tz)
        if trading_dates[0].tz
        else pd.Timestamp(target_date)
    )

    if target_ts in trading_dates:
        return target_ts

    pos = bisect.bisect_left(trading_dates, target_ts)
    if pos == 0:
        return trading_dates[0]
    if pos == len(trading_dates):
        return trading_dates[-1]

    before, after = trading_dates[pos - 1], trading_dates[pos]
    return (
        before
        if abs((target_ts - before).days) <= abs((after - target_ts).days)
        else after
    )


@app.get("/api/chart/{ticker}")
async def get_chart_data(ticker: str, earnings_date: str):
    try:
        # Parse earnings date
        e_date = datetime.strptime(earnings_date, "%Y-%m-%d")

        # Download 400 days of data to ensure we have a full year of trading days
        # Use progress=False to keep logs clean and auto_adjust=True for split/dividend adjusted prices
        df = yf.download(ticker, period="2y", progress=False, auto_adjust=True)
        
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No data found for ticker '{ticker}'.")

        # Clean up data - ensure we have a 'Close' column (or 'Close' equivalents)
        # yfinance can sometimes return multi-index columns depending on version/ticker
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
            
        if "Close" not in df.columns:
            # Fallback for different yfinance versions or data types
            if "Price" in df.columns:
                df["Close"] = df["Price"]
            else:
                raise HTTPException(status_code=500, detail="Unexpected data format from provider.")

        df = df[["Close"]].copy()
        df.columns = ["Price"]
        df.index.name = "Date"
        df.sort_index(inplace=True)
        df = df.dropna(subset=["Price"]) # Final safety check

        trading_dates = df.index.tolist()

        # Handle earnings date
        actual_earnings_date = get_nearest_trading_date(trading_dates, e_date)

        # Calculate stats
        earnings_price = float(df.at[actual_earnings_date, "Price"])
        latest_date = trading_dates[-1]
        latest_price = float(df.at[latest_date, "Price"])

        price_change_pct = ((latest_price - earnings_price) / earnings_price) * 100

        # 1-day change
        idx = trading_dates.index(actual_earnings_date)
        next_day_change = None
        if idx + 1 < len(trading_dates):
            next_price = float(df.at[trading_dates[idx + 1], "Price"])
            next_day_change = ((next_price - earnings_price) / earnings_price) * 100

        # Min/Max
        min_price = float(df["Price"].min())
        max_price = float(df["Price"].max())

        # Prepare chart data for frontend
        chart_data = []
        for date, row in df.iterrows():
            chart_data.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "price": round(float(row["Price"]), 2),
                }
            )

        # Prepare summary stats
        price_range = round(float(max_price - min_price), 2)

        return {
            "ticker": ticker,
            "earnings_date": actual_earnings_date.strftime("%Y-%m-%d"),
            "latest_date": latest_date.strftime("%Y-%m-%d"),
            "earnings_price": round(earnings_price, 2),
            "latest_price": round(latest_price, 2),
            "price_change_pct": round(price_change_pct, 2),
            "next_day_change_pct": (
                round(next_day_change, 2) if next_day_change is not None else None
            ),
            "min_price": round(min_price, 2),
            "max_price": round(max_price, 2),
            "price_range": price_range,
            "data": chart_data,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
