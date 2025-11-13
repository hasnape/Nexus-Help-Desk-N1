import test from "node:test";
import assert from "node:assert/strict";
import { callEdgeWithFallback } from "../services/functionClient";

declare global {
  interface ImportMeta {
    env: Record<string, string>;
  }
}

const resetEnv = () => {
  import.meta.env = {
    VITE_SUPABASE_URL: "https://demo.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon-key",
  };
  process.env.VITE_SUPABASE_URL = "https://demo.supabase.co";
  process.env.VITE_SUPABASE_ANON_KEY = "anon-key";
};

const withMockedFetch = async (
  impl: (...args: Parameters<typeof fetch>) => ReturnType<typeof fetch>,
  run: () => Promise<void>
) => {
  const originalFetch = globalThis.fetch;
  (globalThis as any).fetch = impl;
  try {
    await run();
  } finally {
    (globalThis as any).fetch = originalFetch;
  }
};

test("callEdgeWithFallback falls back after network error", async () => {
  resetEnv();
  const calls: Array<Parameters<typeof fetch>> = [];
  let invocation = 0;

  await withMockedFetch((...args) => {
    calls.push(args);
    invocation += 1;
    if (invocation === 1) {
      return Promise.reject(new TypeError("Failed to fetch"));
    }
    return Promise.resolve(new Response(JSON.stringify({ ok: true }), { status: 200 }));
  }, async () => {
    const result = await callEdgeWithFallback("login-guard", { email: "test@example.com" });
    assert.equal(result.isFallback, true);
  });

  assert.equal(calls.length, 2);
  assert.ok(String(calls[0][0]).includes("functions.supabase.co/login-guard"));
  assert.equal(calls[1][0], "/api/login-guard");
});

test("callEdgeWithFallback returns primary response when successful", async () => {
  resetEnv();
  const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
  const calls: Array<Parameters<typeof fetch>> = [];

  await withMockedFetch((...args) => {
    calls.push(args);
    return Promise.resolve(response);
  }, async () => {
    const result = await callEdgeWithFallback("auth-signup", { email: "foo@example.com" });
    assert.equal(result.isFallback, false);
    assert.equal(result.response, response);
  });

  assert.equal(calls.length, 1);
  assert.ok(String(calls[0][0]).includes("functions.supabase.co/auth-signup"));
});

test("callEdgeWithFallback picks up Supabase keys from the latest environment", async () => {
  resetEnv();
  const response = new Response(JSON.stringify({ ok: true }), { status: 200 });
  const calls: Array<Parameters<typeof fetch>> = [];

  await withMockedFetch((...args) => {
    calls.push(args);
    return Promise.resolve(response);
  }, async () => {
    await callEdgeWithFallback("session-sync", { attempt: 1 });

    import.meta.env.VITE_SUPABASE_ANON_KEY = "rotating-key";
    process.env.VITE_SUPABASE_ANON_KEY = "rotating-key";

    await callEdgeWithFallback("session-sync", { attempt: 2 });
  });

  assert.equal(calls.length, 2);

  const getAuthorizationHeader = (index: number) => {
    const [, init] = calls[index];
    const headers = new Headers(init?.headers);
    return headers.get("Authorization");
  };

  assert.equal(getAuthorizationHeader(0), "Bearer anon-key");
  assert.equal(getAuthorizationHeader(1), "Bearer rotating-key");
});
