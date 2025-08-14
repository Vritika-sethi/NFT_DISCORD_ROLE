
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { recoverMessageAddress } from "viem";
import { z } from "zod";
import { session } from "@/lib/serverAuth";

// Define a schema to validate the request body.
const BodySchema = z.object({
  address: z.string().startsWith("0x").length(42),
  signature: z.string().startsWith("0x"),
  message: z.string().min(1),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  // Validate the request body against the schema.
  const parse = BodySchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: "Bad request", details: parse.error.format() });
  }
  const { address, signature, message } = parse.data;

  // Retrieve the nonce from the cookie.
  const cookies = cookie.parse(req.headers.cookie || "");
  const nonce = cookies["siwe_nonce"];
  if (!nonce) {
    return res.status(400).json({ error: "Missing nonce from session." });
  }

  // Security check: ensure the signed message contains the nonce we issued.
  if (!message.includes(nonce)) {
    return res.status(400).json({ error: "Nonce mismatch." });
  }

  try {
    // Recover the wallet address from the signature and message.
    const recoveredAddress = await recoverMessageAddress({
      message,
      signature: signature as `0x${string}`,
    });
    
    // Compare the recovered address with the address provided in the request.
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ error: "Signature is invalid." });
    }
    
    // If the signature is valid, issue a JWT for the session.
    const jwt = session.issue(address as `0x${string}`);
    
    // Set the session JWT cookie and clear the nonce cookie.
    res.setHeader("Set-Cookie", [
      cookie.serialize("siwe_jwt", jwt, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }),
      cookie.serialize("siwe_nonce", "", { // Expire the nonce cookie.
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: -1,
      }),
    ]);
    
    res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Verification failed:", error);
    res.status(500).json({ error: "Signature verification failed." });
  }
}