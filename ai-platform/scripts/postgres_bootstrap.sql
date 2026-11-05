-- =============================================================================
-- Merkezi LLM Platformu - yerel PostgreSQL hazirlama (GUVENLI / NON-DESTRUCTIVE)
-- =============================================================================
-- Bu betik:
--   * ai_platform_user uygulama kullanicisini (yoksa) olusturur,
--   * ai_platform ve (testler icin) ai_platform_test veritabanlarini (yoksa) olusturur,
--   * minimum gerekli yetkileri verir.
--
-- Mevcut database/kullanici SILINMEZ veya degistirilmez. Var olan kayitlar
-- oldugu gibi birakilir (idempotent).
--
-- Calistirma (superuser, orn. postgres ile):
--   psql -U postgres -v app_password='GUCLU_BIR_PAROLA' -f scripts/postgres_bootstrap.sql
--
-- Not: Parola komut gecmisine dusmesin diye ps1/sh yardimci betiklerini de
-- kullanabilirsiniz (scripts/bootstrap_postgres.ps1).
-- =============================================================================

\set ON_ERROR_STOP on

-- 1) Uygulama kullanicisi (yoksa olustur). Mevcutsa dokunulmaz.
SELECT format('CREATE ROLE ai_platform_user LOGIN PASSWORD %L', :'app_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'ai_platform_user')\gexec

-- 2) Veritabanlari (yoksa olustur), sahibi uygulama kullanicisi.
SELECT 'CREATE DATABASE ai_platform OWNER ai_platform_user'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ai_platform')\gexec

SELECT 'CREATE DATABASE ai_platform_test OWNER ai_platform_user'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'ai_platform_test')\gexec

-- 3) Baglanti yetkisi.
GRANT CONNECT ON DATABASE ai_platform TO ai_platform_user;
GRANT CONNECT ON DATABASE ai_platform_test TO ai_platform_user;

-- 4) public schema uzerinde minimum DDL/DML yetkisi (migration icin gerekli).
\connect ai_platform
GRANT USAGE, CREATE ON SCHEMA public TO ai_platform_user;

\connect ai_platform_test
GRANT USAGE, CREATE ON SCHEMA public TO ai_platform_user;

-- Bilgi mesaji
\echo 'ai_platform_user ve veritabanlari hazir. Mevcut kayitlara dokunulmadi.'

-- Mevcut bir kullanicinin parolasini guncellemek isterseniz (ISTEGE BAGLI, elle):
--   ALTER ROLE ai_platform_user WITH PASSWORD 'YENI_PAROLA';
