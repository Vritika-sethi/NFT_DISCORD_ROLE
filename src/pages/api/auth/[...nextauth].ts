
import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

// Configuration options for NextAuth.js.
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      // Request permissions to identify the user and see which guilds they are in.
      authorization: { params: { scope: "identify guilds" } },
    }),
  ],
  callbacks: {
    // This callback is executed when a JWT is created or updated.
    async jwt({ token, account }) {
      // Persist the user's Discord ID in the JWT for later use.
      if (account?.provider === "discord") {
        token.discordId = account.providerAccountId;
      }
      return token;
    },
    // This callback is executed when a session is checked.
    async session({ session, token }) {
      // Add the Discord ID from the token to the session object.
      (session as any).discordId = token.discordId;
      return session;
    },
  },
};

export default NextAuth(authOptions);