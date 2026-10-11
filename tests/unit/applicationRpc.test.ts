// Юнит-тесты подачи отклика через service role. Запуск: npm run test:unit

import { test } from "node:test";
import assert from "node:assert/strict";

import { callApplicationRpc } from "../../lib/applicationRpc.ts";

type Call = { client: string; fn: string; args: Record<string, unknown> };

function fakeClient(name: string, calls: Call[], missing: string[] = []) {
  return {
    rpc(fn: string, args: Record<string, unknown>) {
      calls.push({ client: name, fn, args });
      if (missing.includes(fn)) {
        return Promise.resolve({ data: null, error: { code: "PGRST202", message: "not found" } });
      }
      return Promise.resolve({ data: { fn }, error: null });
    },
  };
}

test("an anonymous visitor's application goes through the service-role internal function", async () => {
  const calls: Call[] = [];
  const res = await callApplicationRpc(
    { admin: fakeClient("admin", calls), user: fakeClient("user", calls) },
    "submit_application",
    { p_slug: "cook", p_user_id: null },
  );
  assert.deepEqual(res.data, { fn: "submit_application_internal" });
  assert.deepEqual(calls.map((c) => `${c.client}:${c.fn}`), ["admin:submit_application_internal"]);
});

test("a database without the internal function still accepts the application", async () => {
  const calls: Call[] = [];
  const res = await callApplicationRpc(
    { admin: fakeClient("admin", calls, ["submit_application_internal"]), user: fakeClient("user", calls) },
    "submit_application",
    { p_slug: "cook" },
  );
  assert.deepEqual(res.data, { fn: "submit_application" });
  assert.deepEqual(calls.map((c) => `${c.client}:${c.fn}`), [
    "admin:submit_application_internal",
    "admin:submit_application",
  ]);
});

test("a real failure of the internal function is reported, not retried under the old name", async () => {
  const calls: Call[] = [];
  const admin = {
    rpc(fn: string, args: Record<string, unknown>) {
      calls.push({ client: "admin", fn, args });
      return Promise.resolve({ data: null, error: { code: "P0001", message: "rate_limited" } });
    },
  };
  const res = await callApplicationRpc({ admin, user: fakeClient("user", calls) }, "submit_application", {});
  assert.equal(res.error?.message, "rate_limited");
  assert.equal(calls.length, 1);
});

test("without a service-role key the visitor's own client is used, as before", async () => {
  const calls: Call[] = [];
  await callApplicationRpc({ admin: null, user: fakeClient("user", calls) }, "precheck_application", { p_slug: "cook" });
  assert.deepEqual(calls.map((c) => `${c.client}:${c.fn}`), ["user:precheck_application"]);
});
