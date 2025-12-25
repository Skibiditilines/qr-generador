from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

Base = declarative_base()

_engine = None
_SessionLocal = None

def get_engine():
    global _engine, _SessionLocal

    if _engine is None:
        _engine = create_engine(
            settings.DATABASE_URL,
            pool_pre_ping=True,
        )
        _SessionLocal = sessionmaker(
            autocommit=False,
            autoflush=False,
            bind=_engine
        )

    return _engine, _SessionLocal

def get_db():
    _, SessionLocal = get_engine()
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
