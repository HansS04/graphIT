from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import contextlib
from datetime import datetime
from .. import models
from ..core.dependencies import get_current_user
from ..services.data_pump import process_data

router = APIRouter()

pump_status = {"is_running": False, "last_run": None}
pump_logs = ["Systém připraven k synchronizaci..."]

class ListStream:
    def write(self, text):
        if text.strip():
            time_str = datetime.now().strftime('%H:%M:%S')
            pump_logs.append(f"[{time_str}] {text.strip()}")
            if len(pump_logs) > 100:
                pump_logs.pop(0)
    def flush(self):
        pass

def task_wrapper():
    global pump_status
    pump_status["is_running"] = True
    pump_logs.clear()
    pump_logs.append("Spouštím datovou pumpu...")
    try:
        with contextlib.redirect_stdout(ListStream()):
            process_data()
    except Exception as e:
        pump_logs.append(f"[ERROR] {str(e)}")
    finally:
        pump_status["is_running"] = False
        pump_status["last_run"] = datetime.now().isoformat()
        pump_logs.append("Proces úspěšně dokončen.")

@router.post("/pump")
async def trigger_pump(
    background_tasks: BackgroundTasks, 
    current_user: models.User = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    if pump_status["is_running"]:
        return {"message": "Running", "status": "running"}
    background_tasks.add_task(task_wrapper)
    return {"message": "Started", "status": "started"}

@router.get("/pump/status")
async def get_pump_status(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return pump_status

@router.get("/pump/logs")
async def get_pump_logs(current_user: models.User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return {"logs": pump_logs}