from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine
from app.routers import auth, tasks, study_materials, progress, ai_recommendations

Base.metadata.create_all(bind=engine)

app = FastAPI(title="BrainGraph API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(study_materials.router)
app.include_router(progress.router)
app.include_router(ai_recommendations.router)


@app.get("/")
def root():
    return {"status": "BrainGraph API running"}
