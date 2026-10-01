import { renderSurfaceSvg } from "@/lib/surface-svg";

export const dynamic = "force-static";

export function GET() {
  return new Response(renderSurfaceSvg(), {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
