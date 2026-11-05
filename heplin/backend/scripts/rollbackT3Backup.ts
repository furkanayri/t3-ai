import {
  argumentValue,
  assertLocalMongoUri,
  createLocalArchive,
  isPortOpen,
  restoreArchive,
} from "./t3BackupUtils";

async function rollback() {
  assertLocalMongoUri();
  if (await isPortOpen(3000)) {
    throw new Error("Backend is listening on port 3000. Stop npm run dev:local before rolling back.");
  }
  const archive = argumentValue("--archive");
  if (!archive) throw new Error('Use --archive "<archive.gz>"');

  const currentSafetyArchive = createLocalArchive("pre-manual-rollback");
  console.log(`Current database safety archive: ${currentSafetyArchive}`);
  restoreArchive(archive);
  console.log(`Rollback completed from ${archive}`);
}

rollback().catch((error) => {
  console.error(`T3 rollback failed: ${error.message}`);
  process.exitCode = 1;
});
