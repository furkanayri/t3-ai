"""Veritabani motoru ve session factory.

Varsayilan `sqlite+pysqlite:///:memory:` surec-ici paylasimli (StaticPool) tek
bir sema; `DATABASE_URL` ile Postgres'e gecilir. Session factory tek yerden
verilir; reset_engine() testlerin izole sema kurmasini saglar.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from config.settings import settings
from orchestrator.models import Base

_engine = None
_Session = None


def _build_engine(url):
    if url.startswith("sqlite") and ":memory:" in url:
        # Tek, paylasimli in-memory sema (coklu session + is parcacigi icin).
        return create_engine(
            url,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool,
            future=True,
        )
    if url.startswith("sqlite"):
        # Dosya-tabanli SQLite (docker volume): API + surec-ici worker thread'leri
        # ayni baglantiyi kullanabildiginden check_same_thread kapatilir (DB erisimi
        # engine.py'de _ENGINE_LOCK ile serilestirilir).
        return create_engine(url, connect_args={"check_same_thread": False}, future=True)
    return create_engine(url, future=True)


def init_db():
    global _engine, _Session
    if _engine is None:
        _engine = _build_engine(settings.DATABASE_URL)
        _Session = sessionmaker(bind=_engine, expire_on_commit=False, future=True)
        Base.metadata.create_all(_engine)
    return _Session


def reset_engine():
    """Testler arasi temiz sema (yalnizca in-memory/dev icin)."""
    global _engine, _Session
    if _engine is not None:
        _engine.dispose()
    _engine = None
    _Session = None
    return init_db()


def session():
    if _Session is None:
        init_db()
    return _Session()
