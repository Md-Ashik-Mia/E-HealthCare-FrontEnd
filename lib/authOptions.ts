import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/services/authService";

// Debugging secret loading
console.log("🔑 NEXTAUTH_SECRET check:", process.env.NEXTAUTH_SECRET ? "Defined" : "Undefined", process.env.NODE_ENV);

export const authOptions: NextAuthOptions = {
    // Use environment variable for secret, fallback to hardcoded (dev only)
    secret: process.env.NEXTAUTH_SECRET || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    debug: process.env.NODE_ENV === "development",
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("🔐 Authorize called with:", credentials?.email);
                try {
                    // Call backend login API
                    const data = await loginUser({
                        email: credentials?.email || "",
                        password: credentials?.password || "",
                    });

                    // The token is already stored in localStorage by authService
                    // Return user object
                    if (data && data.user) {
                        return {
                            id: data.user.id || data.user._id || "1",
                            name: data.user.name,
                            email: data.user.email,
                            role: data.user.role,
                            accessToken: data.token,
                        } as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                    }
                    return null;
                } catch (error) {
                    console.error("Login failed:", error);
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role; // eslint-disable-line @typescript-eslint/no-explicit-any
                token.accessToken = (user as any).accessToken; // eslint-disable-line @typescript-eslint/no-explicit-any
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).role = token.role; // eslint-disable-line @typescript-eslint/no-explicit-any
                (session.user as any).accessToken = token.accessToken; // eslint-disable-line @typescript-eslint/no-explicit-any
                (session.user as any).id = token.id; // eslint-disable-line @typescript-eslint/no-explicit-any
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
};
