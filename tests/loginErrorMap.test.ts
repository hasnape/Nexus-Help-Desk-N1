import test from "node:test";
import assert from "node:assert/strict";
import { mapLoginGuardError } from "../services/loginGuardErrorMapper";

const translator = (key: string, options?: Record<string, any>) => {
  if (options?.default) {
    return `${key}:${options.default}`;
  }
  if (options && "company" in options) {
    return `${key}:${options.company}`;
  }
  return key;
};

test("mapLoginGuardError returns specific messages for known reasons", () => {
  assert.ok(mapLoginGuardError(translator, "company_conflict").includes("login.error.companyConflict"));
  assert.equal(mapLoginGuardError(translator, "company_missing"), "login.error.companyNotFound");
  assert.ok(mapLoginGuardError(translator, "origin_not_allowed").includes("originNotAllowed"));
  assert.ok(mapLoginGuardError(translator, "forbidden").includes("guardNotAllowed"));
});

test("mapLoginGuardError prefers backend message", () => {
  assert.equal(mapLoginGuardError(translator, undefined, "Custom failure"), "Custom failure");
});

test("mapLoginGuardError falls back to generic translation", () => {
  assert.ok(mapLoginGuardError(translator, "unknown_reason").includes("login.error.guardFailed"));
});
