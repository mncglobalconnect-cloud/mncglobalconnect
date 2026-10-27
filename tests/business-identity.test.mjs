import assert from "node:assert/strict";
import test from "node:test";
import { identifierRule, isValidMobile, phonePlan, postalRule, requiredIdentifiers } from "../src/lib/business-identity.ts";
import { countryCodes } from "../src/data/country-codes.ts";
import { membershipCountries } from "../src/data/membership.ts";

test("every listed country has an ISO code", () => {
  for (const country of membershipCountries) assert.match(countryCodes[country] ?? "", /^[A-Z]{2}$/, country);
});

test("phone plans follow the business country", () => {
  assert.equal(phonePlan(countryCodes.India)?.dialCode, "+91");
  assert.equal(phonePlan(countryCodes["United Kingdom"])?.dialCode, "+44");
  assert.equal(phonePlan(countryCodes["United Arab Emirates"])?.dialCode, "+971");
  assert.ok(phonePlan(countryCodes.India)?.example);
  assert.equal(phonePlan(countryCodes.Antarctica), null);
});

test("mobile numbers are validated against the selected country", () => {
  assert.ok(isValidMobile("98765 43210", "IN"));
  assert.ok(!isValidMobile("12345", "IN"));
  assert.ok(isValidMobile("07400 123456", "GB"));
  assert.ok(!isValidMobile("98765 43210", "GB"));
});

test("postal codes use the country's format and are optional where none exist", () => {
  assert.ok(postalRule("India").isValid("600001"));
  assert.ok(!postalRule("India").isValid("060001"));
  assert.ok(postalRule("United Kingdom").isValid("SW1A 1AA"));
  assert.equal(postalRule("United Arab Emirates").required, false);
  assert.ok(postalRule("Kenya").isValid("anything"));
});

test("registration identifiers are checked where a format is known", () => {
  assert.ok(identifierRule("India", "gstin").isValid("33AAAAA0000A1Z5"));
  assert.ok(!identifierRule("India", "gstin").isValid("33AAAAA0000"));
  assert.ok(identifierRule("India", "udyam").isValid("UDYAM-TN-02-0012345"));
  assert.ok(identifierRule("United States", "tax").isValid("12-3456789"));
  assert.equal(identifierRule("Kenya", "registration"), null);
  assert.deepEqual(requiredIdentifiers("Germany"), ["registration"]);
  assert.ok(requiredIdentifiers("India").includes("gstin"));
});
