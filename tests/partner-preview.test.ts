import { test } from "node:test";
import assert from "node:assert/strict";
import { privatePartnerAssetAllowed } from "../src/lib/partner-preview-policy";

const asset = () => ({
  slot: "partner-0",
  width: 480,
  height: 480,
  source: { root: "client", relative: "partners/example.png" },
  derivative: { root: "preview", relative: `${"a".repeat(64)}-480.webp` },
});
test("partner previews admit exactly six bounded supplied-logo slots", () => {
  for (let i = 0; i < 6; i++)
    assert.equal(
      privatePartnerAssetAllowed({ ...asset(), slot: `partner-${i}` }),
      true,
    );
  for (const slot of [
    "partner-6",
    "partner-05",
    "partner--1",
    "gallery-0",
    "logo",
  ])
    assert.equal(privatePartnerAssetAllowed({ ...asset(), slot }), false);
});
test("partner preview paths and dimensions cannot inherit another media scope", () => {
  for (const source of [
    { root: "originals", relative: "partners/example.png" },
    { root: "client", relative: "team/example.png" },
    { root: "client", relative: "partners/../example.png" },
    { root: "client", relative: "partners\\example.png" },
    { root: "client", relative: "partners/example.svg" },
  ])
    assert.equal(privatePartnerAssetAllowed({ ...asset(), source }), false);
  assert.equal(
    privatePartnerAssetAllowed({
      ...asset(),
      derivative: { root: "library", relative: asset().derivative.relative },
    }),
    false,
  );
  assert.equal(
    privatePartnerAssetAllowed({
      ...asset(),
      derivative: { root: "preview", relative: `${"a".repeat(64)}-1440.webp` },
    }),
    false,
  );
  for (const width of [0, -1, 481, 480.5, Infinity])
    assert.equal(privatePartnerAssetAllowed({ ...asset(), width }), false);
});
