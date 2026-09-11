import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

/**
 * Browsing is public. Only surfaces that depend on a signed-in learner are
 * gated here — never in client code. Server routes that write per-user state
 * (progress) get added to this list when they land.
 */
const isProtectedRoute = createRouteMatcher(["/my-learning(.*)"]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
