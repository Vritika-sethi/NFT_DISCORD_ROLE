
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code = req.query.code as string | undefined;
  if (!code) {
    return res.status(400).send("Authorization code is missing.");
  }

  try {
   
    const body = new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID!,
      client_secret: process.env.DISCORD_CLIENT_SECRET!,
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI!,
    });

    const tokenResp = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    
    

    if (!tokenResp.ok) {
      throw new Error("Failed to exchange code for token.");
    }
    const tok = await tokenResp.json();

    const userResp = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    
    if (!userResp.ok) {
      throw new Error("Failed to fetch user information.");
    }
    const user = (await userResp.json()) as { id: string };

    res.setHeader(
      "Set-Cookie",
      cookie.serialize("discord_user_id", user.id, {
        httpOnly: true, 
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, 
      }),
    );

    res.redirect("/");
  } catch (e: any) {
    console.error("Discord callback error:", e);
    res.status(500).send(e?.message ?? "An error occurred during the Discord callback.");
  }
}