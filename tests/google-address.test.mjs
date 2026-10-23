import assert from "node:assert/strict";
import test from "node:test";
import { getMapQuery, parseGoogleAddress } from "../src/lib/google-address.ts";

const component = (type, longText, shortText = longText) => ({ types: [type], longText, shortText });
const sample = {
  id: "sample-place-id",
  formattedAddress: "12 Sample Road, Chennai, Tamil Nadu 600001, India",
  addressComponents: [
    component("street_number", "12"), component("route", "Sample Road"),
    component("locality", "Chennai"), component("administrative_area_level_2", "Chennai"),
    component("administrative_area_level_1", "Tamil Nadu"), component("postal_code", "600001"),
    component("country", "India", "IN"),
  ],
};

test("Google address fills independent address fields and a place-specific map link", () => {
  const address = parseGoogleAddress(sample, ["India"]);
  assert.deepEqual({ ...address, mapsUrl: "" }, {
    line1: "12 Sample Road", line2: "", city: "Chennai", state: "Tamil Nadu",
    district: "Chennai", postalCode: "600001", country: "India", mapsUrl: "",
  });
  assert.equal(new URL(address.mapsUrl).searchParams.get("query_place_id"), sample.id);
  assert.equal(getMapQuery(address), "place_id:sample-place-id");
});

test("country aliases match the existing membership country labels", () => {
  const address = parseGoogleAddress({
    ...sample, addressComponents: [component("country", "Türkiye", "TR")],
  }, ["India", "Turkiye"]);
  assert.equal(address.country, "Turkiye");
  assert.equal(address.city, "");
  assert.equal(address.state, "");
  assert.equal(address.postalCode, "");
  assert.equal(address.line2, "");
});

test("UK postal town and US ZIP suffix are retained", () => {
  const uk = parseGoogleAddress({
    ...sample, addressComponents: [component("country", "United Kingdom", "GB"), component("postal_town", "London")],
  }, ["United Kingdom"]);
  assert.equal(uk.city, "London");
  assert.equal(uk.district, "London");
  const us = parseGoogleAddress({
    ...sample, addressComponents: [component("country", "United States", "US"), component("postal_code", "90001"), component("postal_code_suffix", "1234")],
  }, ["United States"]);
  assert.equal(us.postalCode, "90001-1234");
});

test("unsupported and incomplete results are rejected rather than assigned to the current country", () => {
  assert.throws(() => parseGoogleAddress(sample, ["Germany"]), /supported country/);
  assert.throws(() => parseGoogleAddress({ ...sample, id: "" }, ["India"]), /incomplete address/);
  assert.throws(() => parseGoogleAddress({ ...sample, addressComponents: [] }, ["India"]), /supported country/);
});

test("map query uses edited fields when no trusted place link exists", () => {
  const address = { ...parseGoogleAddress(sample, ["India"]), mapsUrl: "" };
  assert.equal(getMapQuery(address), "12 Sample Road, Chennai, Tamil Nadu, 600001, India");
  for (const mapsUrl of ["not-a-url", "https://example.com/maps/search/?query_place_id=wrong", "javascript:alert(1)"]) {
    assert.equal(getMapQuery({ ...address, mapsUrl }), getMapQuery(address));
  }
});
