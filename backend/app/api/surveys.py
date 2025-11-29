from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.extras import Survey, SurveyCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/surveys", response_model=Survey)
def create_survey(survey: SurveyCreate):
    data = survey.dict(exclude_unset=True)
    resp = supabase.table("survey_survey").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create survey")
    return resp.data[0]

@router.get("/surveys", response_model=List[Survey])
def read_surveys():
    resp = supabase.table("survey_survey").select("*").execute()
    return resp.data
