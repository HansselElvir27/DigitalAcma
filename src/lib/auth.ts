import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getPrismaClient } from "@/lib/db";
import { verifyPassword, needsRehash, hashPassword } from "@/lib/password";

// Trust proxy headers (X-Forwarded-Host, X-Forwarded-Proto) in NextAuth v4
process.env.AUTH_TRUST_HOST = "true";

const rawSecret = process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here-change-in-production";
const NEXTAUTH_SECRET = rawSecret.replace(/^["']|["']$/g, "").trim();

// Strip trailing slash and quotes from NEXTAUTH_URL if present
if (process.env.NEXTAUTH_URL) {
    let cleanUrl = process.env.NEXTAUTH_URL.replace(/^["']|["']$/g, "").trim();
    if (cleanUrl.endsWith("/")) {
        cleanUrl = cleanUrl.slice(0, -1);
    }
    process.env.NEXTAUTH_URL = cleanUrl;
}

export const authOptions: NextAuthOptions = {
    secret: NEXTAUTH_SECRET,
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: Record<string, string> | undefined) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                let prisma;
                try {
                    prisma = getPrismaClient();
                } catch (err: any) {
                    console.error("[AUTH] Prisma init failed:", err.message);
                    return null;
                }

                try {
                    const normalizedEmail = credentials.email.trim().toLowerCase();
                    const user = await prisma.user.findUnique({
                        where: { email: normalizedEmail }
                    });

                    if (!user || !user.password) {
                        console.log(`[AUTH] User not found or has no password: ${normalizedEmail}`);
                        return null;
                    }

                    const isValid = verifyPassword(credentials.password, user.password);
                    console.log(`[AUTH] Password verify result for ${user.email}: ${isValid} (Role: ${user.role})`);
                    if (!isValid) {
                        console.log(`[AUTH] Invalid password for ${user.email}`);
                        return null;
                    }

                    // Auto-migrate legacy plaintext password to secure scrypt hash
                    if (needsRehash(user.password)) {
                        try {
                            const newHash = hashPassword(credentials.password);
                            await prisma.user.update({
                                where: { id: user.id },
                                data: { password: newHash }
                            });
                            console.log(`[AUTH] Password automatically migrated to scrypt for: ${user.email}`);
                        } catch (migrationErr: any) {
                            console.error("[AUTH] Failed to upgrade password hash:", migrationErr.message);
                        }
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        portId: user.portId,
                    };
                } catch (error: any) {
                    console.error("[AUTH] Authorization error:", error.message);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any; user: any }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.portId = user.portId;
                console.log(`[AUTH CALLBACK] JWT set for user ${user.email} with role: ${user.role}`);
            }
            return token;
        },
        async session({ session, token }: { session: any; token: any }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).portId = token.portId;
            }
            return session;
        }
    },
    session: {
        strategy: "jwt",
        maxAge: 8 * 60 * 60, // 8 hours max session
    },
    pages: {
        signIn: "/auth/signin",
    }
};
