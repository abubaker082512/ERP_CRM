from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional, Any
from pydantic import BaseModel
import secrets


router = APIRouter()


class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    state: Optional[str] = "draft"


class SurveyUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None


class QuestionCreate(BaseModel):
    title: str
    question_type: Optional[str] = "text"
    options: Optional[Any] = None
    sequence: Optional[int] = 0


class ResponseCreate(BaseModel):
    respondent_name: Optional[str] = None
    respondent_email: Optional[str] = None
    answers: Optional[Any] = None


# ─── Surveys ────────────────────────────────────────────────

@router.post("/surveys")
def create_survey(survey: SurveyCreate, client: Client = Depends(get_supabase_client)):
    data = survey.dict(exclude_unset=True)
    data["access_token"] = secrets.token_hex(16)
    resp = client.table("survey_survey").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create survey")
    return resp.data[0]


@router.get("/surveys")
def read_surveys(state: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("survey_survey").select("*").order("created_at", desc=True)
    if state:
        query = query.eq("state", state)
    resp = query.execute()
    return resp.data or []


@router.get("/surveys/{survey_id}")
def read_survey(survey_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("survey_survey").select("*").eq("id", survey_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Survey not found")
    survey = resp.data[0]
    # Attach questions
    q_resp = client.table("survey_question").select("*").eq("survey_id", survey_id).order("sequence").execute()
    survey["questions"] = q_resp.data or []
    return survey


@router.put("/surveys/{survey_id}")
def update_survey(survey_id: str, survey: SurveyUpdate, client: Client = Depends(get_supabase_client)):
    data = survey.dict(exclude_unset=True)
    resp = client.table("survey_survey").update(data).eq("id", survey_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Survey not found")
    return resp.data[0]


@router.delete("/surveys/{survey_id}")
def delete_survey(survey_id: str, client: Client = Depends(get_supabase_client)):
    client.table("survey_question").delete().eq("survey_id", survey_id).execute()
    client.table("survey_survey").delete().eq("id", survey_id).execute()
    return {"message": "Survey deleted"}


# ─── Questions ───────────────────────────────────────────────

@router.post("/surveys/{survey_id}/questions")
def add_question(survey_id: str, q: QuestionCreate, client: Client = Depends(get_supabase_client)):
    data = q.dict(exclude_unset=True)
    data["survey_id"] = survey_id
    resp = client.table("survey_question").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not add question")
    return resp.data[0]


@router.get("/surveys/{survey_id}/questions")
def get_questions(survey_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("survey_question").select("*").eq("survey_id", survey_id).order("sequence").execute()
    return resp.data or []


@router.delete("/surveys/{survey_id}/questions/{question_id}")
def delete_question(survey_id: str, question_id: str, client: Client = Depends(get_supabase_client)):
    client.table("survey_question").delete().eq("id", question_id).execute()
    return {"message": "Question deleted"}


# ─── Responses ───────────────────────────────────────────────

@router.post("/surveys/{survey_id}/responses")
def submit_response(survey_id: str, resp_body: ResponseCreate, client: Client = Depends(get_supabase_client)):
    data = resp_body.dict(exclude_unset=True)
    data["survey_id"] = survey_id
    resp = client.table("survey_response").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not submit response")
    return resp.data[0]


@router.get("/surveys/{survey_id}/responses")
def get_responses(survey_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("survey_response").select("*").eq("survey_id", survey_id).execute()
    return resp.data or []
