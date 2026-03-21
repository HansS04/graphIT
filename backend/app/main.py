from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models
from app.database import engine
from app.api import auth, users, presets, market, admin_pump

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router, prefix="/users")
app.include_router(presets.router, prefix="/api/presets")
app.include_router(market.router, prefix="/api")
app.include_router(admin_pump.router, prefix="/api/admin")