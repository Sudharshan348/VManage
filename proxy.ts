import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function proxy(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: ["/v1/admin/:path*", "/v1/student/:path*"]
}