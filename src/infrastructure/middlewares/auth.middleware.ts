import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth/better-auth.server";

type Session = typeof auth.$Infer.Session;
type User = Session["user"];

type AuthenticatedHandler<TExtra = {}> = (
  req: NextRequest,
  context: { user: User } & TExtra
) => Promise<NextResponse | Response>;

/**
 * Wraps a route handler and ensures the request carries a valid session.
 * Returns 401 if no session is found.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest): Promise<NextResponse | Response> => {
    const session = await auth.api.getSession({ headers: req.headers });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(req, { user: session.user });
  };
}

/**
 * Extension example: requires a role field on the user.
 * Replace the role check with whatever authorization logic fits your domain
 * (e.g. a permissions service, a DB lookup, an external policy engine).
 */
export function withAdminAccess(
  handler: AuthenticatedHandler<{ user: User & { role?: string } }>
) {
  return withAuth(async (req, { user }) => {
    const typedUser = user as User & { role?: string };

    if (typedUser.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, { user: typedUser });
  });
}
