import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { getPrismaClient } from "@/lib/db"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log(`[AUTH] Attempt for: ${credentials?.email}`)

                if (!credentials?.email || !credentials?.password) {
                    console.log("[AUTH] Missing credentials")
                    return null
                }

                let prisma
                try {
                    prisma = getPrismaClient()
                } catch (err: any) {
                    console.error("[AUTH] Prisma init failed:", err.message)
                    return null
                }

                try {
                    console.log(`[AUTH] Querying for user: ${credentials.email}`)
                    const user = await prisma.user.findUnique({
                        where: { email: credentials.email }
                    })

                    console.log(`[AUTH] User found: ${!!user}`)

                    if (!user || user.password !== credentials.password) {
                        console.log(`[AUTH] Invalid credentials for: ${credentials.email}`)
                        return null
                    }

                    console.log(`[AUTH] Success for: ${credentials.email}`)
                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        portId: user.portId,
                    }
                } catch (error: any) {
                    console.error("[AUTH] Query error:", error.message)
                    return null
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }: { token: any, user: any }) {
            if (user) {
                token.id = user.id
                token.role = user.role
                token.portId = user.portId
            }
            return token
        },
        async session({ session, token }: { session: any, token: any }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).portId = token.portId;
            }
            return session
        }
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    }
}
