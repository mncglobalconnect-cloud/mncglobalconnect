import assert from "node:assert/strict";
import test from "node:test";
import { getVerificationProfile } from "../src/data/membership-verification.ts";

test("India includes GST, company, MSME and import/export verification", () => {
  const profile = getVerificationProfile("India");
  assert.equal(profile.countrySpecific, true);
  assert.deepEqual(profile.fields.map(({ key }) => key), ["gstin", "cin", "udyam", "iec", "registration"]);
  assert.ok(profile.documents.some(({ kind }) => kind === "GST Registration Certificate"));
  assert.ok(profile.documents.some(({ kind }) => kind === "Importer Exporter Code (IEC) Certificate"));
});

test("UAE uses trade licence and TRN rather than Indian identifiers", () => {
  const profile = getVerificationProfile("United Arab Emirates");
  assert.deepEqual(profile.fields.map(({ label }) => label), ["Trade Licence Number", "Tax Registration Number (TRN)"]);
  assert.ok(profile.documents.some(({ kind }) => kind === "Valid Trade Licence"));
  assert.ok(!profile.documents.some(({ kind }) => /GST|IEC/.test(kind)));
});

test("country profiles keep fields and document categories unique", () => {
  for (const country of ["India", "United States", "United Kingdom", "United Arab Emirates", "Singapore", "Germany", "Australia", "Canada"]) {
    const profile = getVerificationProfile(country);
    assert.equal(profile.countrySpecific, true, country);
    assert.equal(new Set(profile.fields.map(({ key }) => key)).size, profile.fields.length, country);
    assert.equal(new Set(profile.documents.map(({ kind }) => kind)).size, profile.documents.length, country);
    assert.ok(profile.documents.some(({ kind }) => kind === "Business Address Proof"), country);
    assert.ok(profile.documents.some(({ guidance }) => guidance.startsWith("Required")), country);
    assert.ok(profile.documents.some(({ guidance }) => guidance.startsWith("Only if")), country);
    assert.ok(profile.documents.some(({ guidance }) => guidance.startsWith("Optional")), country);
  }
});

test("countries without a dedicated profile receive explicit general guidance", () => {
  for (const country of ["Bangladesh", "", "toString", "__proto__"]) {
    const profile = getVerificationProfile(country);
    assert.equal(profile.countrySpecific, false);
    assert.equal(profile.fields[0].label, "Business Registration Number");
    assert.ok(profile.documents.some(({ kind }) => kind === "Local Tax / VAT Registration Certificate"));
  }
});

test("changing profile cannot mutate the next country's checklist", () => {
  const india = getVerificationProfile("India");
  india.documents.pop();
  const us = getVerificationProfile("United States");
  assert.ok(us.documents.some(({ kind }) => kind.includes("EIN")));
  assert.ok(!us.documents.some(({ kind }) => kind.includes("IEC")));
  assert.ok(getVerificationProfile("India").documents.some(({ kind }) => kind === "Other Supporting Document"));
});
