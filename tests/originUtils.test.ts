import test from "node:test";
import assert from "node:assert/strict";
import {
  parseOrigins,
  createAllowedOriginSet,
  isOriginAllowed,
  resolveAllowOrigin,
} from "../supabase/functions/_shared/originUtils";
import { isOriginBlocked } from "../shared/blockedOrigins";

test("origin utilities trim and deduplicate lists", () => {
  const parsed = parseOrigins([" https://example.com ", "https://example.com,https://foo.dev "]); 
  assert.deepEqual(parsed, ["https://example.com", "https://example.com", "https://foo.dev"]);

  const allowed = createAllowedOriginSet("https://example.com, https://foo.dev", "https://foo.dev", ["https://bar.test"]);
  assert.deepEqual(Array.from(allowed), [
    "https://example.com",
    "https://foo.dev",
    "https://bar.test",
  ]);
});

test("origin utilities handle empty sets", () => {
  const allowed = createAllowedOriginSet(null, undefined, []);
  assert.equal(allowed.size, 0);
  assert.equal(isOriginAllowed(null, allowed), true);
  assert.equal(resolveAllowOrigin(null, allowed), "*");
});

test("origin utilities validate membership", () => {
  const allowed = createAllowedOriginSet("https://one.test", "https://two.test");
  assert.equal(isOriginAllowed("https://one.test", allowed), true);
  assert.equal(isOriginAllowed("https://three.test", allowed), false);
  assert.equal(resolveAllowOrigin("https://three.test", allowed), "https://one.test");
});

test("blocked origins are filtered and rejected", () => {
  const blocked = "https://infragrid.v.network";
  assert.equal(isOriginBlocked(blocked), true);
  assert.deepEqual(parseOrigins(blocked), []);

  const allowed = createAllowedOriginSet(blocked, "https://safe.test");
  assert.deepEqual(Array.from(allowed), ["https://safe.test"]);

  assert.equal(isOriginAllowed(blocked, allowed), false);
  assert.equal(resolveAllowOrigin(blocked, allowed), "https://safe.test");
});
