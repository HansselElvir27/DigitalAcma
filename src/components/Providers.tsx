"use client"

import { SessionProvider } from "next-auth/react"
import { InactivityTracker } from "./InactivityTracker"

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider 
            refetchInterval={2 * 60} 
            refetchOnWindowFocus={true}
        >
            <InactivityTracker />
            {children}
        </SessionProvider>
    )
}
