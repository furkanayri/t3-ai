"""Yonetim CLI'si: proje ve API anahtari yonetimi, Kafka topic, warmup.

Ornekler:
    python -m app.cli create-project --code heplin --name "Heplin"
    python -m app.cli create-api-key --project heplin --name local-development
    python -m app.cli disable-api-key --key-id <uuid>
    python -m app.cli revoke-api-key --key-id <uuid>
    python -m app.cli list-projects
    python -m app.cli list-api-keys --project heplin
    python -m app.cli create-topics
    python -m app.cli warmup
"""

from __future__ import annotations

import argparse
import asyncio
import uuid
from datetime import timedelta

from sqlalchemy import select

from app.config import get_settings
from app.db.engine import Database
from app.db.models import ApiClient, Project
from app.db.repositories import utcnow
from app.entrypoints._common import configure_event_loop_policy
from app.security.api_key import generate_api_key


async def _create_project(db: Database, code: str, name: str) -> None:
    async with db.session() as s:
        existing = (
            await s.execute(select(Project).where(Project.code == code))
        ).scalar_one_or_none()
        if existing is not None:
            print(f"HATA: '{code}' kodlu proje zaten var (id={existing.id})")
            return
        project = Project(code=code, name=name, is_active=True)
        s.add(project)
        await s.flush()
        print(f"Proje olusturuldu: code={code} id={project.id}")


async def _create_api_key(
    db: Database, project_code: str, name: str, expires_days: int | None
) -> None:
    settings = get_settings()
    async with db.session() as s:
        project = (
            await s.execute(select(Project).where(Project.code == project_code))
        ).scalar_one_or_none()
        if project is None:
            print(f"HATA: '{project_code}' kodlu proje bulunamadi")
            return
        generated = generate_api_key(settings.api_key_hmac_secret)
        expires_at = None
        if expires_days is not None:
            expires_at = utcnow() + timedelta(days=expires_days)
        client = ApiClient(
            id=generated.key_id,
            project_id=project.id,
            name=name,
            secret_hash=generated.secret_hash,
            is_active=True,
            expires_at=expires_at,
        )
        s.add(client)
        await s.flush()
        print("API anahtari olusturuldu. Bu deger YALNIZCA BIR KEZ gosterilir:")
        print(f"  key_id : {generated.key_id}")
        print(f"  project: {project_code}")
        print(f"  API KEY: {generated.full_key}")
        if expires_at:
            print(f"  expires: {expires_at.isoformat()}")


async def _disable_api_key(db: Database, key_id: str) -> None:
    async with db.session() as s:
        client = await s.get(ApiClient, uuid.UUID(key_id))
        if client is None:
            print("HATA: API anahtari bulunamadi")
            return
        client.is_active = False
        print(f"API anahtari devre disi birakildi: {key_id}")


async def _revoke_api_key(db: Database, key_id: str) -> None:
    async with db.session() as s:
        client = await s.get(ApiClient, uuid.UUID(key_id))
        if client is None:
            print("HATA: API anahtari bulunamadi")
            return
        client.is_active = False
        client.revoked_at = utcnow()
        print(f"API anahtari iptal edildi (revoke): {key_id}")


async def _disable_project(db: Database, code: str) -> None:
    async with db.session() as s:
        project = (
            await s.execute(select(Project).where(Project.code == code))
        ).scalar_one_or_none()
        if project is None:
            print("HATA: proje bulunamadi")
            return
        project.is_active = False
        print(f"Proje devre disi birakildi: {code}")


async def _list_projects(db: Database) -> None:
    async with db.session() as s:
        projects = (await s.execute(select(Project).order_by(Project.created_at))).scalars().all()
        if not projects:
            print("(proje yok)")
            return
        for p in projects:
            print(f"{p.code:20} {p.id}  aktif={p.is_active}  {p.name}")


async def _list_api_keys(db: Database, project_code: str) -> None:
    async with db.session() as s:
        project = (
            await s.execute(select(Project).where(Project.code == project_code))
        ).scalar_one_or_none()
        if project is None:
            print("HATA: proje bulunamadi")
            return
        clients = (
            await s.execute(select(ApiClient).where(ApiClient.project_id == project.id))
        ).scalars().all()
        if not clients:
            print("(api anahtari yok)")
            return
        for c in clients:
            state = "aktif" if (c.is_active and c.revoked_at is None) else "pasif"
            print(f"{c.id}  {state:6}  {c.name}  revoked={c.revoked_at}")


def _create_topics() -> None:
    from app.kafka.admin import ensure_topics

    ensure_topics(get_settings())
    print("Kafka topic'leri hazir")


async def _warmup() -> None:
    from app.llm.ollama import build_model_client

    client = build_model_client(get_settings())
    try:
        await client.warmup()
        print("Warmup tamamlandi")
    finally:
        await client.aclose()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="app.cli", description="Merkezi LLM platformu yonetim CLI"
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p = sub.add_parser("create-project")
    p.add_argument("--code", required=True)
    p.add_argument("--name", required=True)

    p = sub.add_parser("create-api-key")
    p.add_argument("--project", required=True)
    p.add_argument("--name", required=True)
    p.add_argument("--expires-days", type=int, default=None)

    p = sub.add_parser("disable-api-key")
    p.add_argument("--key-id", required=True)

    p = sub.add_parser("revoke-api-key")
    p.add_argument("--key-id", required=True)

    p = sub.add_parser("disable-project")
    p.add_argument("--code", required=True)

    sub.add_parser("list-projects")

    p = sub.add_parser("list-api-keys")
    p.add_argument("--project", required=True)

    sub.add_parser("create-topics")
    sub.add_parser("warmup")
    return parser


def main(argv: list[str] | None = None) -> None:
    configure_event_loop_policy()
    args = build_parser().parse_args(argv)

    if args.command == "create-topics":
        _create_topics()
        return
    if args.command == "warmup":
        asyncio.run(_warmup())
        return

    settings = get_settings()
    db = Database(settings)

    async def _dispatch() -> None:
        try:
            if args.command == "create-project":
                await _create_project(db, args.code, args.name)
            elif args.command == "create-api-key":
                await _create_api_key(db, args.project, args.name, args.expires_days)
            elif args.command == "disable-api-key":
                await _disable_api_key(db, args.key_id)
            elif args.command == "revoke-api-key":
                await _revoke_api_key(db, args.key_id)
            elif args.command == "disable-project":
                await _disable_project(db, args.code)
            elif args.command == "list-projects":
                await _list_projects(db)
            elif args.command == "list-api-keys":
                await _list_api_keys(db, args.project)
        finally:
            await db.dispose()

    asyncio.run(_dispatch())


if __name__ == "__main__":
    main()
