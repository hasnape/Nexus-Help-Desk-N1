import test from "node:test";
import assert from "node:assert/strict";
import {
  parseOrigins,
  createAllowedOriginSet,
  isOriginAllowed,
  resolveAllowOrigin,
} from "../supabase/functions/_shared/originUtils";

import {
  filterBlockedOrigins,
  isOriginBlocked,
  listBlockedOrigins,
} from "../shared/blockedOrigins";

test("origin utilities trim and deduplicate lists", () => {
  const parsed = parseOrigins([
    " https://example.com ",
    "https://example.com,https://foo.dev ",
  ]);
  // parseOrigins returns flattened entries (may include duplicates)
  assert.deepEqual(parsed, [
    "https://example.com",
    "https://example.com",
    "https://foo.dev",
  ]);

  const allowed = createAllowedOriginSet(
    "https://example.com, https://foo.dev",
    "https://foo.dev",
    ["https://bar.test"],
  );
  // Set preserves insertion order of first occurrences
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

  // parseOrigins should drop blocked entries
  const parsed = parseOrigins(blocked as unknown as string[] | string);
  assert.deepEqual(parsed, []);

  const allowed = createAllowedOriginSet(blocked, "https://safe.test");
  assert.deepEqual(Array.from(allowed), ["https://safe.test"]);

  assert.equal(isOriginAllowed(blocked, allowed), false);
  assert.equal(resolveAllowOrigin(blocked, allowed), "https://safe.test");
});

test("environment configuration extends the blocked origin list", () => {
  const originalBlocked = process.env.BLOCKED_ORIGINS;
  const originalSupabaseBlocked = process.env.SUPABASE_BLOCKED_ORIGINS;
  const originalPublicBlocked = process.env.NEXT_PUBLIC_BLOCKED_ORIGINS;

  process.env.BLOCKED_ORIGINS = "https://custom-blocked.test, other-blocked.test";
  process.env.SUPABASE_BLOCKED_ORIGINS = "http://extra-blocked.test";
  process.env.NEXT_PUBLIC_BLOCKED_ORIGINS = "subdomain.blocked";

  try {
    const blockedHosts = listBlockedOrigins();
    assert.ok(blockedHosts.includes("infragrid.v.network"));
    assert.ok(blockedHosts.includes("custom-blocked.test"));
    assert.ok(blockedHosts.includes("other-blocked.test"));
    assert.ok(blockedHosts.includes("extra-blocked.test"));
    assert.ok(blockedHosts.includes("subdomain.blocked"));

    assert.equal(isOriginBlocked("https://custom-blocked.test"), true);
    assert.equal(isOriginBlocked("https://extra-blocked.test"), true);
    assert.equal(isOriginBlocked("https://safe-origin.test"), false);

    const filtered = filterBlockedOrigins([
      "https://safe-origin.test",
      "https://custom-blocked.test",
      "https://extra-blocked.test",
      "https://subdomain.blocked",
    ]);
    assert.deepEqual(filtered, ["https://safe-origin.test"]);
  } finally {
    process.env.BLOCKED_ORIGINS = originalBlocked;
    process.env.SUPABASE_BLOCKED_ORIGINS = originalSupabaseBlocked;
    process.env.NEXT_PUBLIC_BLOCKED_ORIGINS = originalPublicBlocked;
  }
});
