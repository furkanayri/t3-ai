import { argumentValue, inspectBackupSource } from "./t3BackupUtils";

try {
  const inspection = inspectBackupSource(argumentValue("--source"));
  console.log("T3 backup is structurally valid.");
  console.table({
    database: inspection.databaseName,
    serverVersion: inspection.serverVersion,
    toolVersion: inspection.toolVersion,
    bsonCollections: inspection.bsonFiles,
    metadataFiles: inspection.metadataFiles,
    sizeMiB: (inspection.totalBytes / 1024 / 1024).toFixed(2),
  });
} catch (error) {
  console.error(`T3 backup inspection failed: ${(error as Error).message}`);
  process.exitCode = 1;
}
