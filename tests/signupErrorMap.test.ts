import test from "node:test";
import assert from "node:assert/strict";
import { mapSignupError } from "../services/signupErrorMapper";

const translator = (key: string, options?: Record<string, any>) => {
  if (options?.default) {
    return `${key}:${options.default}`;
  }
  if (options?.companyName || options?.company) {
    return `${key}:${options.companyName ?? options.company}`;
  }
  return key;
};

test("mapSignupError maps known codes", () => {
  assert.equal(mapSignupError(translator, "company_conflict"), "signup.error.companyNameTaken");
  assert.equal(
    mapSignupError(translator, "company_missing", undefined, { companyName: "Acme" }),
    "signup.error.companyNotFound:Acme"
  );
  assert.ok(mapSignupError(translator, "invalid_role").includes("invalidRole"));
});

test("mapSignupError handles backend failures", () => {
  assert.ok(mapSignupError(translator, "company_lookup_failed").includes("companyLookupFailed"));
  assert.ok(mapSignupError(translator, "user_create_failed").includes("userCreateFailed"));
  assert.ok(mapSignupError(translator, "profile_insert_failed").includes("profileInsertFailed"));
});

test("mapSignupError falls back to message or generic key", () => {
  assert.equal(mapSignupError(translator, "unexpected", "Boom"), "Boom");
  assert.equal(mapSignupError(translator), "signup.error.generic");
});
