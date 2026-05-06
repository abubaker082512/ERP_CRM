from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from app.schemas.project import Project, ProjectCreate, ProjectTask, ProjectTaskCreate
from typing import List

router = APIRouter()

@router.get("/projects", response_model=List[Project])
def read_projects(client: Client = Depends(get_supabase_client)):
    resp = client.table("project_project").select("*").execute()
    return resp.data or []

@router.post("/projects", response_model=Project)
def create_project(project: ProjectCreate, client: Client = Depends(get_supabase_client)):
    data = project.dict(exclude_unset=True)
    resp = client.table("project_project").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create project")
    return resp.data[0]

@router.get("/tasks", response_model=List[ProjectTask])
def read_tasks(project_id: Optional[str] = None, client: Client = Depends(get_supabase_client)):
    query = client.table("project_task").select("*")
    if project_id:
        query = query.eq("project_id", project_id)
    resp = query.execute()
    return resp.data or []

@router.post("/tasks", response_model=ProjectTask)
def create_task(task: ProjectTaskCreate, client: Client = Depends(get_supabase_client)):
    data = task.dict(exclude_unset=True)
    if 'date_deadline' in data and data['date_deadline']:
        data['date_deadline'] = data['date_deadline'].isoformat()
    resp = client.table("project_task").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create project task")
    return resp.data[0]
