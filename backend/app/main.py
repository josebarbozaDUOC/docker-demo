# backend/main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Inicializar
app = FastAPI()

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo
class Task(BaseModel):
    id: int
    title: str

class TaskCreate(BaseModel):
    title: str

tasks: list[Task] = []
id_counter = 1

# Rutas
@app.post("/tasks", response_model=Task)
async def create_task(task: TaskCreate):
    global id_counter
    new_task = Task(id=id_counter, title=task.title)
    tasks.append(new_task)
    id_counter += 1
    return new_task

@app.get("/tasks", response_model=list[Task])
async def all_task():
    return tasks

@app.delete("/tasks/{task_id}")
async def delete_task(task_id: int):
    for index, task in enumerate(tasks):
        if task.id == task_id:
            tasks.pop(index)
            return {"message": "Task deleted successfully"}
    raise HTTPException(status_code=404, detail="Task not found")