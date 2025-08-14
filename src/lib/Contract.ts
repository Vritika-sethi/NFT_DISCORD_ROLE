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

// Add the specific NFTs you want the bot to check for here.
export const NFTS_TO_CHECK: NftTarget[] = [
  { address: "0xA47612C1FA7EDaE9e29A723E71A50EEFA4f25896", tokenId: "1", label: "NFT #1" },
  { address: "0xB9e88A5143c14e622d803b924363e874E7e1e5cc", tokenId: "1", label: "NFT #2" },
];

// Set this to 'true' if the user must own all NFTs in the list to get the role.
// Set to 'false' if owning any single NFT from the list is sufficient.
export const requireAll = false;