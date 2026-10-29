import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import test from "node:test";

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (context.parentURL?.endsWith("/src/lib/listings.ts") && specifier === "../data/country-codes") {
      return nextResolve(`${specifier}.ts`, context);
    }
    return nextResolve(specifier, context);
  },
});
const { isWebsiteUrl, validateListing } = await import("../src/lib/listings.ts");

const event = {
  title: "Global partnerships forum", category: "Networking", country: "Singapore", city: "Singapore",
  date: "2028-02-29", redirectUrl: "https://organiser.example/register?event=123", published: true,
};
const opportunity = { ...event, category: "buyer-requirement", industry: "Packaging" };

test("validates and normalizes both listing types with default images", () => {
  const result = validateListing({ ...event, title: `  ${event.title}  ` }, "events");
  assert.equal(result.error, undefined);
  assert.equal(result.value.title, event.title);
  assert.equal(result.value.countryCode, "SG");
  assert.equal(result.value.image, "/images/events/networking.jpg");
  assert.equal(result.value.published, true);
  const draft = validateListing({ ...opportunity, published: false }, "opportunities").value;
  assert.equal(draft.published, false);
  assert.equal(draft.city, "");
  assert.equal(draft.image, "/images/opportunities/packaging.jpg");
  assert.equal(validateListing({ ...event, country: "Online", city: "Online" }, "events").value.countryCode, "");
});

test("accepts complete HTTP(S) links and rejects unsafe or malformed destinations", () => {
  for (const url of ["https://example.com/a?x=1#register", "http://example.com", "HTTPS://EXAMPLE.COM/path"]) assert.ok(isWebsiteUrl(url), url);
  for (const url of ["", "/events/123", "//example.com", "javascript:alert(1)", "data:text/html,test", "ftp://example.com", "https://", "https://name:password@example.com", "https://example.com/ a", "https://example.com\\evil", "https://example.com/\nregister", `https://example.com/${"a".repeat(2048)}`]) {
    assert.equal(isWebsiteUrl(url), false, url);
    assert.ok(validateListing({ ...event, redirectUrl: url }, "events").error, url);
  }
  assert.equal(validateListing({ ...event, redirectUrl: `  ${event.redirectUrl}  ` }, "events").value.redirectUrl, event.redirectUrl);
});

test("rejects impossible dates and wrong field types, countries and categories", () => {
  for (const date of ["2027-02-29", "2028-02-30", "2028-13-01", "2028-2-01", "bad"]) assert.ok(validateListing({ ...event, date }, "events").error, date);
  for (const invalid of [null, [], { ...event, title: "" }, { ...event, title: "a".repeat(181) }, { ...event, summary: [] }, { ...event, country: "Unknown" }, { ...event, country: "constructor" }, { ...event, city: "" }, { ...event, published: "true" }]) {
    assert.ok(validateListing(invalid, "events").error);
  }
  for (const invalid of [{ ...opportunity, category: "unknown" }, { ...opportunity, category: "__proto__" }, { ...opportunity, industry: "" }, { ...opportunity, country: "Online" }]) {
    assert.ok(validateListing(invalid, "opportunities").error);
  }
});

test("validates image sources without accepting executable or traversal URLs", () => {
  for (const image of ["https://images.example.com/photo.jpg", "/images/events/networking.jpg"]) {
    assert.equal(validateListing({ ...event, image }, "events").value.image, image);
  }
  for (const image of ["javascript:alert(1)", "//example.com/photo.jpg", "/images/../../secret.png", "data:image/svg+xml,test", "/images/test.svg"]) {
    assert.ok(validateListing({ ...event, image }, "events").error, image);
  }
});
