import { NftTarget } from "./chain";

export const ERC721_ABI = [
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "owner", type: "address" }],
  },
] as const;

export const NFTS_TO_CHECK: NftTarget[] = [
  { address: "0xA47612C1FA7EDaE9e29A723E71A50EEFA4f25896", tokenId: "1", label: "NFT #1" },
  { address: "0xB9e88A5143c14e622d803b924363e874E7e1e5cc", tokenId: "1", label: "NFT #2" },
  { address: "0xC562d38438DFdc1be982F071Cb525b219a1707f3", tokenId: "1", label: "NFT #3"},
  {address: "0xE0F90d471a407752293D581997A539b261224176", tokenId: "1", label: "NFT #4"}
];

export const requireAll = false;