from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.etl.runner import run_etl
import asyncio

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.post("/run-etl")
async def trigger_etl(background_tasks: BackgroundTasks):
    """
    Manually triggers the World Bank and FRED ETL pipeline in the background.
    """
    try:
        # Define a wrapper to run the synchronous run_etl in a background thread if needed,
        # but since run_etl is currently written as a standard function, we can just pass it.
        background_tasks.add_task(run_etl)
        return {"success": True, "message": "ETL pipeline started in the background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to start ETL: {str(e)}")
