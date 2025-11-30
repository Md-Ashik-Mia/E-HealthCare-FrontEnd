import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { loginUser } from "@/services/authService";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
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
                        };
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
                token.role = user.role;
                token.accessToken = user.accessToken;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role;
                session.user.accessToken = token.accessToken;
                session.user.id = token.id;
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

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
