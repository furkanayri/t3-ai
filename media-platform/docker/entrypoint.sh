#!/usr/bin/env sh
# Rol secici giris noktasi. Ilk arguman rolu belirler:
#   api         -> FastAPI control plane (uvicorn). RUN_INPROC_WORKER=1 ise
#                  ayni surecte surec-ici worker + bakim dongusu de kosar.
#   worker      -> standalone calistirma dongusu (surec-ici worker + bakim).
#   dispatcher  -> yalniz periyodik bakim (reconcile + webhook + retention).
#   <diger>     -> argumanlari oldugu gibi calistir (orn. pytest, python ...).
set -e

ROLE="${1:-api}"
shift 2>/dev/null || true

case "$ROLE" in
  api)
    exec uvicorn api.app:app --host 0.0.0.0 --port "${PORT:-8000}" "$@"
    ;;
  worker)
    exec python -m workers.runner "$@"
    ;;
  dispatcher)
    exec python -c "from workers import runner; runner.run_maintenance_loop()"
    ;;
  *)
    exec "$ROLE" "$@"
    ;;
esac
