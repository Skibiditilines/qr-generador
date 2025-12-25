from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import user_routes

app = FastAPI(title="QR API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_routes.router, prefix="/api")

@app.get("/api/health")
def health():
    return {"ok": True}
