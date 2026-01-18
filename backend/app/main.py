from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import auth, profile, search, emails, integrations
from app.core.config import settings
from app.core.database import engine, Base

app = FastAPI(title="Academic Email Assistant API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(emails.router, prefix="/api/emails", tags=["emails"])
app.include_router(integrations.router, prefix="/api/integrations", tags=["integrations"])

@app.on_event("startup")
async def startup():
    # Create tables
    Base.metadata.create_all(bind=engine)

@app.get("/")
async def root():
    return {"message": "Academic Email Assistant API"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
