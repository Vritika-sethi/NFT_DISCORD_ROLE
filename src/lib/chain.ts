// lib/chain.ts
import { defineChain } from "thirdweb/chains";

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
  tokenId: string; 
  label?: string;
};

export const ERC721_ABI = [
  {
    "type": "function",
    "name": "balanceOf",
    "stateMutability": "view",
    "inputs": [
      { "name": "owner", "type": "address" }
    ],
    "outputs": [
      { "name": "balance", "type": "uint256" }
    ]
  }
  
] as const;

export const NFTS_TO_CHECK: NftTarget[] = [
  { address: "0xA47612C1FA7EDaE9e29A723E71A50EEFA4f25896", tokenId: "1", label: "NFT #1" },
  { address: "0xB9e88A5143c14e622d803b924363e874E7e1e5cc", tokenId: "1", label: "NFT #2" },
];

export const requireAll = false; 
