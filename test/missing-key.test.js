import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";
import {
  INVALID_API_KEY_MESSAGE,
  MISSING_API_KEY_MESSAGE,
  requireApiKey,
  AuthError,
} from "../dist/auth.js";

const bin = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "dist",
  "index.js",
);

function spawnBin(env) {
  const childEnv = { ...process.env, ...env };
  if (!("QRBLOX_API_KEY" in env)) {
    delete childEnv.QRBLOX_API_KEY;
  }
  return spawn(process.execPath, [bin], {
    env: childEnv,
    stdio: ["ignore", "ignore", "pipe"],
  });
}

function waitForExit(child, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    let stderr = "";
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error(`timed out waiting for process exit.\n${stderr}`));
    }, timeoutMs);
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.on("close", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stderr });
    });
  });
}

test("requireApiKey throws a clear AuthError when unset", () => {
  assert.throws(
    () => requireApiKey({}),
    (err) =>
      err instanceof AuthError && err.message === MISSING_API_KEY_MESSAGE,
  );
});

test("process starts and fails clearly without QRBLOX_API_KEY", async () => {
  const { code, stderr } = await waitForExit(spawnBin({}));
  assert.equal(code, 1);
  assert.match(stderr, /QRBLOX_API_KEY/);
  assert.match(stderr, /https:\/\/app\.qrblox\.com\/settings/);
  assert.match(stderr, /sk-qrblox-/);
  assert.equal(stderr.trim(), MISSING_API_KEY_MESSAGE.trim());
});

test("process fails clearly when the key is not a Qrblox merchant key", async () => {
  const { code, stderr } = await waitForExit(
    spawnBin({ QRBLOX_API_KEY: "not-a-qrblox-key" }),
  );
  assert.equal(code, 1);
  assert.match(stderr, /sk-qrblox-/);
  assert.match(stderr, /https:\/\/app\.qrblox\.com\/settings/);
  assert.equal(stderr.trim(), INVALID_API_KEY_MESSAGE.trim());
});
