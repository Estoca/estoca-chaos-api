import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

interface Token {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  accessToken?: string; // This will hold the *backend* JWT
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account && account.access_token) {
        try {
          const response = await fetch(`${process.env.INTERNAL_API_URL}auth/google`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${account.access_token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            const errorData = await response.text();
            console.error('Failed to get API token:', response.status, errorData);
            throw new Error(`Failed to get API token: ${response.status}`);
          }

          const data = await response.json();
          token.accessToken = data.access_token;
        } catch (error) {
          console.error("Error fetching backend token:", error);
          return { ...token, error: "BackendTokenError" };
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || '';
        (session as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export { handler as GET, handler as POST };

 