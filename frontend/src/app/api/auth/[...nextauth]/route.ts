import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"

interface Token {
  sub: string;
  name?: string;
  email?: string;
  picture?: string;
  accessToken?: string;
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
      if (account) {
        // Get our API token from the backend using internal URL for server-side requests
        const response = await fetch(`${process.env.INTERNAL_API_URL}/auth/google`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${account.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to get API token');
        }

        const data = await response.json();
        token.accessToken = data.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user = {
          id: token.sub,
          name: token.name || "",
          email: token.email || "",
          image: token.picture || "",
          accessToken: (token as Token).accessToken,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
})

export { handler as GET, handler as POST };

 