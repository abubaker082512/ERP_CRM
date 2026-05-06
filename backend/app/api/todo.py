from app.api.deps import get_supabase_client
from supabase import Client
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import date


router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[str] = "normal"
    due_date: Optional[date] = None
    tags: Optional[List[str]] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[date] = None
    is_completed: Optional[bool] = None
    tags: Optional[List[str]] = None


class ToggleBody(BaseModel):
    is_completed: bool


@router.post("/tasks")
def create_task(task: TaskCreate, client: Client = Depends(get_supabase_client)):
    data = task.dict(exclude_unset=True)
    if data.get("due_date"):
        data["due_date"] = str(data["due_date"])
    resp = client.table("todo_task").insert(data).execute()
    if not resp.data:
        raise HTTPException(status_code=400, detail="Could not create task")
    return resp.data[0]


@router.get("/tasks")
def read_tasks(
    priority: Optional[str] = None,
    is_completed: Optional[bool] = None,
    client: Client = Depends(get_supabase_client)
):
    query = client.table("todo_task").select("*").order("created_at", desc=True)
    if priority:
        query = query.eq("priority", priority)
    if is_completed is not None:
        query = query.eq("is_completed", is_completed)
    resp = query.execute()
    return resp.data or []


@router.get("/tasks/{task_id}")
def read_task(task_id: str, client: Client = Depends(get_supabase_client)):
    resp = client.table("todo_task").select("*").eq("id", task_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return resp.data[0]


@router.put("/tasks/{task_id}")
def update_task(task_id: str, task: TaskUpdate, client: Client = Depends(get_supabase_client)):
    data = task.dict(exclude_unset=True)
    if data.get("due_date"):
        data["due_date"] = str(data["due_date"])
    resp = client.table("todo_task").update(data).eq("id", task_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return resp.data[0]


@router.put("/tasks/{task_id}/toggle")
def toggle_task(task_id: str, body: ToggleBody, client: Client = Depends(get_supabase_client)):
    resp = client.table("todo_task").update({"is_completed": body.is_completed}).eq("id", task_id).execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="Task not found")
    return resp.data[0]


@router.delete("/tasks/{task_id}")
def delete_task(task_id: str, client: Client = Depends(get_supabase_client)):
    client.table("todo_task").delete().eq("id", task_id).execute()
    return {"message": "Task deleted"}
