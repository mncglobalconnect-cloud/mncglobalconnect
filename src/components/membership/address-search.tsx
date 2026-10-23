"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { membershipCountries } from "@/data/membership";
import { getMapQuery, parseGoogleAddress } from "@/lib/google-address";
import type { BusinessAddress } from "@/types/membership";

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

export function AddressSearch({ onSelect }: { onSelect: (address: BusinessAddress) => void }) {
  const [enabled, setEnabled] = useState(false);
  if (!apiKey) return <div className="join-notice">Google address search and map preview are not configured yet. You can still use the location dropdowns and enter your address manually.</div>;
  return <section className="mb-6 rounded-xl border border-[#dce6ef] p-5" aria-label="Google address search">
    <h4 className="font-semibold text-[#082b59]">Find Your Business Address</h4>
    <p className="my-3 text-sm text-[#617087]">Optional. Enabling search connects to Google Maps; your searches are sent to Google. Selecting a result replaces the business address. A different country also clears verification identifiers and document selections. Review all filled fields.</p>
    {enabled ? <GoogleAddressSearch onSelect={onSelect} /> : <button type="button" className="text-sm font-semibold text-[#0878c7]" onClick={() => setEnabled(true)}>Enable Google address search</button>}
  </section>;
}

function GoogleAddressSearch({ onSelect }: { onSelect: (address: BusinessAddress) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const onSelectRef = useRef(onSelect);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading Google address search...");
  const [error, setError] = useState("");
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);

  useEffect(() => {
    const previous = window.gm_authFailure;
    const authFailure = () => {
      setError("Google Maps could not authorize this website. Check the API key, billing and website restrictions. Enter your address manually.");
      previous?.();
    };
    window.gm_authFailure = authFailure;
    return () => {
      if (window.gm_authFailure === authFailure) window.gm_authFailure = previous;
    };
  }, []);

  useEffect(() => {
    if (ready) return;
    const timer = setTimeout(() => setError("Google address search has not loaded. Check your connection and API configuration, or use manual entry."), 20000);
    return () => clearTimeout(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    let disposed = false;
    let widget: google.maps.places.PlaceAutocompleteElement | undefined;
    let sequence = 0;
    async function initialize() {
      try {
        const { PlaceAutocompleteElement } = await google.maps.importLibrary("places") as google.maps.PlacesLibrary;
        if (disposed || !container.current) return;
        widget = new PlaceAutocompleteElement({});
        widget.setAttribute("aria-label", "Search for your business address");
        widget.style.width = "100%";
        widget.addEventListener("gmp-error", () => {
          if (!disposed) setError("Google address suggestions are unavailable. Check API configuration or enter the address manually.");
        });
        widget.addEventListener("gmp-select", async (event: google.maps.places.PlacePredictionSelectEvent) => {
          const request = ++sequence;
          setError("");
          setStatus("Loading selected address...");
          try {
            const place = event.placePrediction.toPlace();
            await place.fetchFields({ fields: ["id", "addressComponents", "formattedAddress"] });
            if (disposed || request !== sequence) return;
            const address = parseGoogleAddress(place, membershipCountries);
            onSelectRef.current(address);
            setStatus("Address filled from Google. Review the address fields and use Preview map to check the location.");
          } catch (error) {
            if (!disposed && request === sequence) {
              setError(error instanceof Error ? error.message : "Could not retrieve this address. Enter it manually.");
              setStatus("");
            }
          }
        });
        container.current.replaceChildren(widget);
        setStatus("Search for a business, street or address, then choose a suggestion.");
      } catch (error) {
        if (!disposed) setError(error instanceof Error ? error.message : "Google address search could not start. Use manual entry.");
      }
    }
    void initialize();
    return () => { disposed = true; widget?.remove(); };
  }, [ready]);

  return <>
    <Script id="google-maps-places" src={`https://maps.googleapis.com/maps/api/js?${new URLSearchParams({ key: apiKey!, libraries: "places", v: "weekly" })}`}
      onReady={() => { setReady(true); setError(""); }} onError={() => setError("Google Maps failed to load. Check your connection or enter the address manually.")} />
    <div ref={container} onKeyDown={(event) => { if (event.key === "Enter") event.preventDefault(); }} />
    <p className="join-field-help" role="status">{status}</p>
    {error && <p className="join-field-error" role="alert">{error}</p>}
  </>;
}

export function AddressMapPreview({ address }: { address: BusinessAddress }) {
  const [preview, setPreview] = useState("");
  const query = getMapQuery(address);
  if (!apiKey) return null;
  const canPreview = Boolean(address.line1.trim() && address.country);
  const src = `https://www.google.com/maps/embed/v1/place?${new URLSearchParams({ key: apiKey, q: query })}`;
  return <section className="mt-6" aria-label="Business address map preview">
    <p className="mb-3 text-sm text-[#617087]">Preview sends this location to Google Maps. A map pin is guidance only, not address verification.</p>
    <button type="button" className="text-sm font-semibold text-[#0878c7] disabled:opacity-50" disabled={!canPreview} onClick={() => setPreview(query)}>Preview map</button>
    {!canPreview && <p className="join-field-help">Enter an address and country first.</p>}
    {preview === query && canPreview && <iframe title="Business address on Google Maps" className="mt-4 h-80 w-full rounded-xl border-0"
      src={src} loading="lazy" allowFullScreen referrerPolicy="strict-origin-when-cross-origin" />}
  </section>;
}
