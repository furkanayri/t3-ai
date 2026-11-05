"""Async SQLAlchemy engine ve session yonetimi.

Uzun omurlu bir engine + baglanti havuzu kullanilir; her istekte yeni engine
olusturulmaz. Transaction'lar kisa tutulur ve ayni AsyncSession eszamanli
gorevler arasinda paylasilmaz.
"""

from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import Settings


class Database:
    def __init__(self, settings: Settings, *, url: str | None = None):
        self._engine: AsyncEngine = create_async_engine(
            url or settings.database_url,
            pool_size=settings.db_pool_size,
            max_overflow=settings.db_max_overflow,
            pool_timeout=settings.db_pool_timeout_seconds,
            pool_pre_ping=True,
            pool_recycle=1800,
            future=True,
            connect_args={
                # Ollama/Kafka beklerken DB baglantisini tutmamak icin komut
                # seviyesinde timeout; uzun calisan sorgular iptal edilir.
                "options": f"-c statement_timeout={settings.db_command_timeout_seconds * 1000}"
            },
        )
        self._session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
            bind=self._engine,
            expire_on_commit=False,
            autoflush=False,
        )

    @property
    def engine(self) -> AsyncEngine:
        return self._engine

    @property
    def session_factory(self) -> async_sessionmaker[AsyncSession]:
        return self._session_factory

    @asynccontextmanager
    async def session(self) -> AsyncIterator[AsyncSession]:
        """Tek bir islem birimi icin kisa omurlu session (begin/commit/rollback)."""

        async with self._session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    @asynccontextmanager
    async def begin(self) -> AsyncIterator[AsyncSession]:
        """Acik transaction ile session (with blogu sonunda otomatik commit)."""

        async with self._session_factory() as session, session.begin():
            yield session

    async def dispose(self) -> None:
        await self._engine.dispose()

    async def healthcheck(self) -> bool:
        from sqlalchemy import text

        async with self._session_factory() as session:
            await session.execute(text("SELECT 1"))
        return True

    def pool_stats(self) -> dict[str, int]:
        pool = self._engine.pool
        stats: dict[str, int] = {}
        for name in ("size", "checkedin", "checkedout", "overflow"):
            fn = getattr(pool, name, None)
            if callable(fn):
                try:
                    stats[name] = int(fn())
                except (TypeError, ValueError):
                    continue
        return stats
