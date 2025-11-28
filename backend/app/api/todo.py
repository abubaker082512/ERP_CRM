from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID

from app.schemas.todo import Task, TaskCreate
from app.core.supabase_client import supabase

router = APIRouter()

@router.post("/tasks", response_model=Task)
def create_task(task: TaskCreate):
    data = task.dict(exclude_unset=True)
    if data.get('due_date'):
        data['due_date'] = str(data['due_date'])
        
    resp = supabase.table("todo_task").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create task")
    return resp.data[0]

@router.get("/tasks", response_model=List[Task])
def read_tasks():
    resp = supabase.table("todo_task").select("*").order("created_at").execute()
    return resp.data

@router.put("/tasks/{task_id}/toggle", response_model=Task)
def toggle_task(task_id: UUID, is_completed: bool):
    resp = supabase.table("todo_task").update({"is_completed": is_completed}).eq("id", str(task_id)).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return resp.data[0]
