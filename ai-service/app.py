from __future__ import annotations

from pathlib import Path
from typing import Literal

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

MODEL_PATH = Path(__file__).resolve().parent / "models" / "employee_task_suitability.joblib"
app = FastAPI(title="Resource Allocation ML Service", version="1.0.0")
artifact = joblib.load(MODEL_PATH) if MODEL_PATH.exists() else None


class Candidate(BaseModel):
    employee_id: int
    employee_name: str
    department_match: int = Field(ge=0, le=1)
    designation: str = "Unknown"
    experience_years: float = Field(default=0, ge=0)
    active_tasks: int = Field(default=0, ge=0)
    completed_tasks: int = Field(default=0, ge=0)
    overdue_tasks: int = Field(default=0, ge=0)
    completion_rate: float = Field(default=0, ge=0, le=1)
    average_completion_days: float = Field(default=0, ge=0)
    similar_tasks_completed: int = Field(default=0, ge=0)
    current_workload: float = Field(default=0, ge=0, le=100)
    availability_status: Literal["Available", "Busy", "Unavailable"] = "Available"
    task_priority: Literal["Low", "Medium", "High"] = "Medium"
    planned_duration_days: int = Field(default=1, ge=1)


class RecommendationRequest(BaseModel):
    candidates: list[Candidate]
    limit: int = Field(default=5, ge=1, le=50)


def reasons(candidate: Candidate) -> list[str]:
    result = []
    if candidate.department_match: result.append("Same department as the project")
    if candidate.current_workload <= 40: result.append(f"Low current workload ({candidate.current_workload:.0f}%)")
    elif candidate.current_workload >= 75: result.append(f"High current workload ({candidate.current_workload:.0f}%) may reduce fit")
    if candidate.completion_rate >= .8: result.append(f"Strong completion history ({candidate.completion_rate * 100:.0f}%)")
    if candidate.similar_tasks_completed: result.append(f"Completed {candidate.similar_tasks_completed} task(s) in similar projects")
    if candidate.overdue_tasks: result.append(f"Has {candidate.overdue_tasks} currently overdue task(s)")
    if candidate.experience_years >= 5: result.append(f"{candidate.experience_years:g} years of experience")
    return result[:4] or ["Recommendation is based on the candidate's recorded delivery profile"]


@app.get("/health")
def health():
    return {"status": "ok" if artifact else "model_missing", "model_version": artifact.get("model_version") if artifact else None}


@app.post("/recommend-employees")
def recommend(payload: RecommendationRequest):
    if not artifact:
        raise HTTPException(503, "Model is not trained. Run: python train.py")
    if not payload.candidates:
        return {"model_version": artifact["model_version"], "recommendations": []}
    frame = pd.DataFrame([candidate.model_dump() for candidate in payload.candidates])
    probabilities = artifact["pipeline"].predict_proba(frame[artifact["features"]])[:, 1]
    ranked = sorted(zip(payload.candidates, probabilities), key=lambda item: item[1], reverse=True)[:payload.limit]
    return {"model_version": artifact["model_version"], "recommendations": [{"employee_id": candidate.employee_id, "employee_name": candidate.employee_name, "suitability_score": round(float(score) * 100, 1), "prediction": "recommended" if score >= .5 else "review", "reasons": reasons(candidate)} for candidate, score in ranked]}


@app.post("/predict")
def predict(candidate: Candidate):
    response = recommend(RecommendationRequest(candidates=[candidate], limit=1))
    return response["recommendations"][0]
