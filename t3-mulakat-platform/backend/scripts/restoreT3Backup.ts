import { writeFileSync } from "node:fs";
import path from "node:path";

import {
  argumentValue,
  assertLocalMongoUri,
  createLocalArchive,
  dropLocalDatabase,
  ensureBackupDirectory,
  inspectBackupSource,
  isPortOpen,
  restoreArchive,
  restoreDump,
  run,
  runNpmScript,
} from "./t3BackupUtils";

async function restore() {
  assertLocalMongoUri();
  if (await isPortOpen(3000)) {
    throw new Error("Backend is listening on port 3000. Stop npm run dev:local before restoring the database.");
  }

  const inspection = inspectBackupSource(argumentValue("--source"));
  console.log(
    `Validated ${inspection.bsonFiles} collections from MongoDB ${inspection.serverVersion} (${(
      inspection.totalBytes /
      1024 /
      1024
    ).toFixed(2)} MiB).`,
  );

  const safetyArchive = createLocalArchive();
  console.log(`Safety archive: ${safetyArchive}`);
  let destructiveStepStarted = false;

  try {
    run("docker", ["compose", "-f", "docker-compose.local.yml", "up", "-d", "mongo", "--wait"]);
    destructiveStepStarted = true;
    dropLocalDatabase();
    restoreDump(inspection.source);
    runNpmScript("migrate:t3-backup:local");
    runNpmScript("seed:t3-access:local");
    runNpmScript("verify:t3-backup:local");

    const statePath = path.join(ensureBackupDirectory(), "last-t3-restore.json");
    writeFileSync(
      statePath,
      JSON.stringify(
        {
          restoredAt: new Date().toISOString(),
          source: inspection.source,
          rollbackArchive: safetyArchive,
        },
        null,
        2,
      ),
      "utf8",
    );
    console.log("T3 backup restore completed successfully.");
    console.log(`Rollback command: npm run rollback:t3-backup:local -- --archive "${safetyArchive}"`);
  } catch (error) {
    if (destructiveStepStarted) {
      console.error(`Restore failed; rolling back from ${safetyArchive}`);
      restoreArchive(safetyArchive);
      console.error("Automatic rollback completed.");
    }
    throw error;
  }
}

restore().catch((error) => {
  console.error(`T3 backup restore failed: ${error.message}`);
  process.exitCode = 1;
});
