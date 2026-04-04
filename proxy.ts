import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"
import {
  ADMIN_AUTH_COOKIE_NAME,
  AUTH_COOKIE_NAME,
  STUDENT_AUTH_COOKIE_NAME,
} from "@/lib/auth"

export async function proxy(request: NextRequest) {
  const isTryingToAccessAdmin = request.nextUrl.pathname.startsWith("/admin")
  const isTryingToAccessStudent =
    request.nextUrl.pathname.startsWith("/student") || request.nextUrl.pathname.startsWith("/issues")
  const token =
    request.cookies.get(
      isTryingToAccessAdmin
        ? ADMIN_AUTH_COOKIE_NAME
        : isTryingToAccessStudent
          ? STUDENT_AUTH_COOKIE_NAME
          : AUTH_COOKIE_NAME
    )?.value ?? request.cookies.get(AUTH_COOKIE_NAME)?.value
  
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const decoded = jwt.verify(
      token, 
      process.env.JWT_SECRET || "hackathon_secret_key"
    ) as { _id: string, role: string }

    if (isTryingToAccessAdmin && decoded.role !== "admin" && decoded.role !== "warden") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    if (isTryingToAccessStudent && decoded.role !== "student") {
      return NextResponse.redirect(new URL("/", request.url))
    }

    return NextResponse.next()

  } catch {
    const response = NextResponse.redirect(new URL("/login", request.url))
    response.cookies.delete(AUTH_COOKIE_NAME)
    response.cookies.delete(STUDENT_AUTH_COOKIE_NAME)
    response.cookies.delete(ADMIN_AUTH_COOKIE_NAME)
    return response
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/issues/:path*"]
}
