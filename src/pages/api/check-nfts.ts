
import type { NextApiRequest, NextApiResponse } from "next";
import cookie from "cookie";
import { getContract, readContract } from "thirdweb";
import { thirdwebClient } from "@/lib/thirdweb";
import { CHAIN, ERC721_ABI, NFTS_TO_CHECK, requireAll } from "@/lib/chain";
import { session } from "@/lib/serverAuth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const jwt = cookies["siwe_jwt"];
    if (!jwt) {
      return res.status(401).json({ error: "Wallet not authenticated." });
    }

    const { valid, payload } = session.verify(jwt);
    if (!valid) {
      return res.status(401).json({ error: "Invalid session." });
    }

    const address = payload.address.toLowerCase();

    const results = await Promise.all(
      NFTS_TO_CHECK.map(async (nft) => {
        const contract = getContract({
          client: thirdwebClient,
          chain: CHAIN,
          address: nft.address,
          abi: ERC721_ABI,
        });

        try {
          
          const owner = await readContract({
            contract,
            method: "ownerOf",
            params: [BigInt(nft.tokenId)], 
          });
          
          return { ...nft, owned: owner?.toLowerCase() === address };
        } catch (err) {
         
          console.error(`Error checking NFT ${nft.label}:`, err);
          return { ...nft, owned: false };
        }
      })
    );

    const ownsAny = results.some((r) => r.owned);
    const ownsAll = results.every((r) => r.owned);
    const qualifies = requireAll ? ownsAll : ownsAny;

    res.status(200).json({ address, results, ownsAny, ownsAll, qualifies, requireAll });
  } catch (e: any) {
    console.error("Check NFTs error:", e);
    res.status(500).json({ error: e?.message ?? "An internal server error occurred." });
  }
}