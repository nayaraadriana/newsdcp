import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";

const db = getDb();

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),

  advanced: {
    database: {
      generateId: () => crypto.randomUUID(),
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 days
  },

  emailAndPassword: {
    enabled: false,
  },

  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        },
      }
    : {}),

  ...(process.env.AUTH_COOKIE_DOMAIN
    ? {
        crossSubDomainCookies: {
          enabled: true,
          domain: process.env.AUTH_COOKIE_DOMAIN,
        },
      }
    : {}),

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          const [userRow] = await db
            .select({ banned: schema.user.banned })
            .from(schema.user)
            .where(eq(schema.user.id, session.userId));

          if (userRow?.banned) {
            throw new APIError("FORBIDDEN", { message: "USER_BANNED" });
          }
        },
      },
    },
  },
});
