import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { getPrismaClient } from "@/lib/db";
import { verifyPassword, needsRehash, hashPassword } from "@/lib/password";

const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "your-nextauth-secret-here-change-in-production";

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
                        return null;
                    }

                    const isValid = verifyPassword(credentials.password, user.password);
                    if (!isValid) {
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
