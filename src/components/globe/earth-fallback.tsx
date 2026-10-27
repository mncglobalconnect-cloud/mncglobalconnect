import Image from "next/image";

export function EarthFallback({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <Image src="/images/earth/earth-fallback.webp" alt="Satellite-style view of Earth"
        width={720} height={720} className="h-full w-full object-contain" />
      {unavailable && (
        <p role="status" className="absolute inset-x-4 bottom-3 text-center text-xs text-white/55">
          Interactive Earth unavailable. Showing a static view.
        </p>
      )}
    </div>
  );
}
