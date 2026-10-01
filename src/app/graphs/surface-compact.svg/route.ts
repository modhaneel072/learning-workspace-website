import { renderSurfaceSvg } from "@/lib/surface-svg";

export const dynamic = "force-static";

/** The static 3D figure with larger labels, for phones. */
export function GET() {
  return new Response(renderSurfaceSvg({ compact: true }), {
    headers: { "Content-Type": "image/svg+xml; charset=utf-8" },
  });
}
