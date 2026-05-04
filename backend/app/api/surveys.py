from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import UUID

from app.schemas.extras import Survey, SurveyCreate


router = APIRouter()

@router.post("/surveys", response_model=Survey)
def create_survey(survey: SurveyCreate, client: Client = Depends(get_supabase_client)):
    data = survey.dict(exclude_unset=True)
    resp = client.table("survey_survey").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create survey")
    return resp.data[0]

@router.get("/surveys", response_model=List[Survey])
def read_surveys(client: Client = Depends(get_supabase_client)):
    resp = client.table("survey_survey").select("*").execute()
    return resp.data
