from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import SavedReport
from pydantic import BaseModel
from typing import List, Optional
import json
from datetime import datetime

router = APIRouter(prefix="/api/research", tags=["research"])

class SaveReportRequest(BaseModel):
    title: str
    summary: str
    insights: List[str]
    outlook: str
    risk_factors: List[str]

@router.post("/save")
def save_report(request: SaveReportRequest, db: Session = Depends(get_db)):
    try:
        new_report = SavedReport(
            title=request.title,
            summary=request.summary,
            insights=json.dumps(request.insights),
            outlook=request.outlook,
            risk_factors=json.dumps(request.risk_factors)
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)
        return {"success": True, "report_id": new_report.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
def get_saved_reports(db: Session = Depends(get_db)):
    reports = db.query(SavedReport).order_by(SavedReport.created_at.desc()).all()
    
    formatted_reports = []
    for r in reports:
        formatted_reports.append({
            "id": r.id,
            "title": r.title,
            "summary": r.summary,
            "insights": json.loads(r.insights) if r.insights else [],
            "outlook": r.outlook,
            "risk_factors": json.loads(r.risk_factors) if r.risk_factors else [],
            "created_at": r.created_at
        })
        
    return formatted_reports
