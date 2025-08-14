// lib/chain.ts
import { defineChain } from "thirdweb/chains";

// Redbelly mainnet config
// import { defineChain } from "@thirdweb-dev/sdk";

// Full Chain object
export const CHAIN = defineChain({
  id: 151,               // chainId
  name: "Redbelly Mainnet",
  chain: "Redbelly",
  shortName: "rbnt",
  slug: "redbelly",
  nativeCurrency: { name: "RBNT", symbol: "RBNT", decimals: 18 },
  rpc: "https://governors.mainnet.redbelly.network",
  blockExplorers: [
    { name: "Routescan", url: "https://redbelly.routescan.io" }
  ],
});

export type NftTarget = {
  address: `0x${string}`;
  tokenId: string; // keep string to avoid BigInt issues
  label?: string;
};

// Minimal ownerOf ABI
export const ERC721_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
] as const;

// Add your NFT(s) here
export const NFTS_TO_CHECK: NftTarget[] = [
  { address: "0xA47612C1FA7EDaE9e29A723E71A50EEFA4f25896", tokenId: "1", label: "NFT #1" },
  { address: "0xB9e88A5143c14e622d803b924363e874E7e1e5cc", tokenId: "1", label: "NFT #2" },
];

export const requireAll = false; // true if user must own all
