import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // Parse cookies from the request headers to get the user's Discord ID.
  const cookies = cookie.parse(req.headers.cookie || "");
  const userId = cookies["discord_user_id"];

  if (!userId) {
    return res.status(400).json({ error: "Discord account not linked." });
  }

  try {
    // Construct the Discord API URL to add a role to a member in a specific guild.
    const url = `https://discord.com/api/v10/guilds/${process.env.DISCORD_GUILD_ID}/members/${userId}/roles/${process.env.DISCORD_ROLE_ID}`;
    
    // Make the API call using the bot's token for authorization.
    const discordResponse = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    // Handle non-successful responses from the Discord API.
    if (!discordResponse.ok) {
      const errorText = await discordResponse.text();
      console.error("Discord API Error:", errorText);
      return res.status(discordResponse.status).json({ error: "Failed to add Discord role.", detail: errorText });
    }

    // If the role was added successfully, return a 204 No Content response.
    return res.status(204).end();
  } catch (e: any) {
    console.error("Server Error:", e);
    return res.status(500).json({ error: e?.message ?? "An internal server error occurred." });
  }
}