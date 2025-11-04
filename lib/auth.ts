import "server-only";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email ?? "").toLowerCase().trim();
        const password = creds?.password ?? "";

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        const u: User = {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          // keep these literal unions to avoid any
          role: user.role as "ADMIN" | "SUPER_ADMIN" | "DEVELOPER",
          status: user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED",
        } as User;

        return u;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as "ADMIN" | "SUPER_ADMIN" | "DEVELOPER";
        token.status = user.status as "ACTIVE" | "INACTIVE" | "SUSPENDED";
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, status: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role as "ADMIN" | "SUPER_ADMIN" | "DEVELOPER";
          token.status = dbUser.status as "ACTIVE" | "INACTIVE" | "SUSPENDED";
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // these fields are declared in our type augmentation below
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "SUPER_ADMIN" | "DEVELOPER";
        session.user.status = token.status as "ACTIVE" | "INACTIVE" | "SUSPENDED";
      }
      return session;
    },
  },
};

// Helper you can call in Server Components / Server Actions
export function auth() {
  return getServerSession(authOptions);
}
