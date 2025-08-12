import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const apiUrl = process.env.API_URL!;

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
            }
            return token;
        },
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const response = await fetch(`${apiUrl}/users`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            google_id: user.id,
                            email: user.email,
                            name: user.name,
                        }),
                    });

                    return response.ok;
                } catch (error) {
                    console.error("Error contacting backend:", error);
                    return false;
                }
            }
            return false;
        },
    },
});

export { handler as GET, handler as POST };
