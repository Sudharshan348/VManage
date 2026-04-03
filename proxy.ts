import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

export async function proxy(request: NextRequest) {
  const token = request.cookies.get("auth-token")?.value
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "hackathon_secret_key"
    ) as { _id: string, role: string }

    const isTryingToAccessAdmin = request.nextUrl.pathname.startsWith("/admin")
    const isTryingToAccessStudent = request.nextUrl.pathname.startsWith("/student")
    
    if (isTryingToAccessAdmin && decoded.role !== "admin" && decoded.role !== "warden") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isTryingToAccessStudent && decoded.role !== "student") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()

  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete("auth-token")
    return response
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"]
}
