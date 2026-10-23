import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../webbase-app.js", import.meta.url), "utf8");
const pageSource = readFileSync(new URL("../index.html", import.meta.url), "utf8");

test("account rendering does not reveal the staff section inside the catalog", () => {
  assert.doesNotMatch(appSource, /\$\("adminNav"\)\.hidden/);
  assert.match(appSource, /section\.hidden = section\.dataset\.section !== name/);
});

test("login form stays hidden until the saved session is checked", () => {
  assert.match(pageSource, /id="sessionLoading"/);
  assert.match(pageSource, /id="authPanel" class="auth-layout" hidden/);
  assert.match(appSource, /\$\("sessionLoading"\)\.hidden = true/);
});
