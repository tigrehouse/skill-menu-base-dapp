import type { Address } from "viem";

export const MAX_SKILL_LENGTH = 48;
export const MAX_PRICE_LENGTH = 28;
export const MAX_DELIVERY_LENGTH = 28;
export const MAX_DETAILS_LENGTH = 220;

export const skillMenuAbi = [
  {
    type: "event",
    name: "SkillPublished",
    inputs: [
      { name: "skillId", type: "uint256", indexed: true },
      { name: "creator", type: "address", indexed: true },
      { name: "skillName", type: "string", indexed: false },
      { name: "priceNote", type: "string", indexed: false },
      { name: "deliveryTime", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "publishSkill",
    stateMutability: "nonpayable",
    inputs: [
      { name: "skillName", type: "string" },
      { name: "priceNote", type: "string" },
      { name: "deliveryTime", type: "string" },
      { name: "details", type: "string" },
    ],
    outputs: [{ name: "skillId", type: "uint256" }],
  },
  {
    type: "function",
    name: "getSkill",
    stateMutability: "view",
    inputs: [{ name: "skillId", type: "uint256" }],
    outputs: [
      { name: "creator", type: "address" },
      { name: "skillName", type: "string" },
      { name: "priceNote", type: "string" },
      { name: "deliveryTime", type: "string" },
      { name: "details", type: "string" },
      { name: "createdAt", type: "uint256" },
    ],
  },
  {
    type: "function",
    name: "nextSkillId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

function isAddressLike(value?: string) {
  return Boolean(value && /^0x[a-fA-F0-9]{40}$/.test(value));
}

const configuredSkillMenuContractAddress =
  process.env.NEXT_PUBLIC_SKILL_MENU_CONTRACT_ADDRESS?.trim();

export const skillMenuContractAddress = isAddressLike(
  configuredSkillMenuContractAddress,
)
  ? (configuredSkillMenuContractAddress as Address)
  : undefined;
