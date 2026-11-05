import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from "node:fs";
import net from "node:net";
import path from "node:path";

export const T3_SOURCE_DATABASE = "HEPLIN-IK-PRODUCT";
export const LOCAL_DATABASE = "heplin-local";
export const MONGO_IMAGE = "mongo:8.0.16";
export const MONGO_CONTAINER = "heplin-local-mongo";

export const EXPECTED_T3_COUNTS = {
  collections: 69,
  users: 5444,
  candidateanswers: 7154,
  candidateAnswerItems: 26727,
  processedInterviews: 26722,
  processedSuccess: 26591,
  processedFailed: 131,
};

export function argumentValue(name: string) {
  const args = process.argv.slice(2);
  const inline = args.find((item) => item.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);
  const index = args.indexOf(name);
  if (index !== -1) return args[index + 1];
  const positional = args.find((item) => !item.startsWith("--"));
  return positional;
}

export function assertLocalMongoUri(uri = process.env.MONGO_URI || "") {
  if (!uri || !/mongodb:\/\/(localhost|127\.0\.0\.1):27018(?:\/|$)/.test(uri)) {
    throw new Error("This command only accepts the local MongoDB URI on 127.0.0.1:27018");
  }
  return uri;
}

export interface BackupInspection {
  source: string;
  databaseName: string;
  serverVersion: string;
  toolVersion: string;
  bsonFiles: number;
  metadataFiles: number;
  totalBytes: number;
}

export function inspectBackupSource(sourceValue?: string): BackupInspection {
  if (!sourceValue) throw new Error('Use --source "<HEPLIN-IK-PRODUCT directory>"');
  const source = path.resolve(sourceValue);
  if (!existsSync(source) || !statSync(source).isDirectory()) {
    throw new Error(`Backup directory was not found: ${source}`);
  }
  if (path.basename(source) !== T3_SOURCE_DATABASE) {
    throw new Error(`Backup directory must be named ${T3_SOURCE_DATABASE}`);
  }

  const preludePath = path.join(source, "prelude.json");
  if (!existsSync(preludePath)) throw new Error("Backup prelude.json is missing");
  const prelude = JSON.parse(readFileSync(preludePath, "utf8"));
  const files = readdirSync(source, { withFileTypes: true }).filter((item) => item.isFile());
  const bsonNames = files.filter((item) => item.name.endsWith(".bson"));
  const metadataNames = files.filter((item) => item.name.endsWith(".metadata.json"));
  const missingMetadata = bsonNames
    .map((item) => item.name.replace(/\.bson$/, ".metadata.json"))
    .filter((name) => !existsSync(path.join(source, name)));

  if (bsonNames.length !== EXPECTED_T3_COUNTS.collections) {
    throw new Error(`Expected ${EXPECTED_T3_COUNTS.collections} BSON collections, found ${bsonNames.length}`);
  }
  if (missingMetadata.length) {
    throw new Error(`Missing metadata files: ${missingMetadata.join(", ")}`);
  }

  return {
    source,
    databaseName: path.basename(source),
    serverVersion: String(prelude.ServerVersion || "unknown"),
    toolVersion: String(prelude.ToolVersion || "unknown"),
    bsonFiles: bsonNames.length,
    metadataFiles: metadataNames.length,
    totalBytes: files.reduce((sum, item) => sum + statSync(path.join(source, item.name)).size, 0),
  };
}

export function run(command: string, args: string[], options: { cwd?: string; quiet?: boolean } = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || process.cwd(),
    encoding: "utf8",
    stdio: options.quiet ? "pipe" : "inherit",
    windowsHide: true,
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const details = options.quiet ? `\n${result.stdout || ""}${result.stderr || ""}` : "";
    throw new Error(`${command} exited with code ${result.status}${details}`);
  }
  return result;
}

export function runNpmScript(script: string) {
  const scripts: Record<string, string> = {
    "migrate:t3-backup:local": "scripts/migrateT3Backup.ts",
    "seed:t3-access:local": "scripts/seedT3LocalAccess.ts",
    "verify:t3-backup:local": "scripts/verifyT3Backup.ts",
  };
  const entrypoint = scripts[script];
  if (!entrypoint) throw new Error(`Unsupported local script: ${script}`);

  // Calling npm.cmd from a spawnSync child is unreliable on Windows (EINVAL).
  // Execute the TypeScript entry point with the current Node process instead;
  // the parent restore command has already loaded .env.local.
  run(process.execPath, [
    "-r",
    "ts-node/register",
    "-r",
    "tsconfig-paths/register",
    path.resolve(entrypoint),
  ]);
}

export async function isPortOpen(port: number, host = "127.0.0.1") {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port, host });
    const finish = (value: boolean) => {
      socket.removeAllListeners();
      socket.destroy();
      resolve(value);
    };
    socket.setTimeout(750);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

export function ensureBackupDirectory() {
  const directory = path.resolve(".local-backups");
  mkdirSync(directory, { recursive: true });
  return directory;
}

function archiveName(prefix: string) {
  return `${prefix}-${new Date().toISOString().replace(/[:.]/g, "-")}.archive.gz`;
}

export function createLocalArchive(prefix = "pre-t3-restore") {
  const directory = ensureBackupDirectory();
  const name = archiveName(prefix);
  const containerPath = `/tmp/${name}`;
  const hostPath = path.join(directory, name);

  run("docker", [
    "exec",
    MONGO_CONTAINER,
    "mongodump",
    `--db=${LOCAL_DATABASE}`,
    `--archive=${containerPath}`,
    "--gzip",
  ]);
  run("docker", ["cp", `${MONGO_CONTAINER}:${containerPath}`, hostPath]);
  run("docker", ["exec", MONGO_CONTAINER, "rm", "-f", containerPath]);
  if (!existsSync(hostPath) || statSync(hostPath).size === 0) {
    throw new Error("The safety archive was not created");
  }
  return hostPath;
}

export function dropLocalDatabase() {
  run("docker", [
    "exec",
    MONGO_CONTAINER,
    "mongosh",
    "--quiet",
    `mongodb://127.0.0.1:27017/${LOCAL_DATABASE}`,
    "--eval",
    "db.dropDatabase()",
  ]);
}

export function restoreDump(source: string) {
  const parent = path.dirname(source);
  run("docker", [
    "run",
    "--rm",
    "-v",
    `${parent}:/dump:ro`,
    MONGO_IMAGE,
    "mongorestore",
    "--uri=mongodb://host.docker.internal:27018",
    "--drop",
    "--stopOnError",
    `--nsFrom=${T3_SOURCE_DATABASE}.*`,
    `--nsTo=${LOCAL_DATABASE}.*`,
    "/dump",
  ]);
}

export function restoreArchive(archiveValue: string) {
  const archive = path.resolve(archiveValue);
  if (!existsSync(archive) || !statSync(archive).isFile()) {
    throw new Error(`Rollback archive was not found: ${archive}`);
  }
  dropLocalDatabase();
  run("docker", [
    "run",
    "--rm",
    "-v",
    `${path.dirname(archive)}:/backup:ro`,
    MONGO_IMAGE,
    "mongorestore",
    "--uri=mongodb://host.docker.internal:27018",
    "--drop",
    "--stopOnError",
    "--gzip",
    `--archive=/backup/${path.basename(archive)}`,
  ]);
}
