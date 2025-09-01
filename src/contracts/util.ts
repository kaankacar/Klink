import { z } from "zod";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { Network, NetworkType } from "../debug/types/types";

const envSchema = z.object({
  VITE_PUBLIC_STELLAR_NETWORK: z.enum([
    "PUBLIC",
    "FUTURENET",
    "TESTNET",
    "LOCAL",
    "STANDALONE", // deprecated in favor of LOCAL
  ] as const),
  VITE_PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.nativeEnum(WalletNetwork),
  VITE_PUBLIC_STELLAR_RPC_URL: z.string(),
  VITE_PUBLIC_STELLAR_HORIZON_URL: z.string(),
});

const parsed = envSchema.safeParse(import.meta.env);

const env: z.infer<typeof envSchema> = parsed.success
  ? parsed.data
  : {
      VITE_PUBLIC_STELLAR_NETWORK: "TESTNET",
      VITE_PUBLIC_STELLAR_NETWORK_PASSPHRASE: WalletNetwork.TESTNET,
      VITE_PUBLIC_STELLAR_RPC_URL: "https://soroban-testnet.stellar.org",
      VITE_PUBLIC_STELLAR_HORIZON_URL: "https://horizon-testnet.stellar.org",
    };

export const stellarNetwork =
  env.VITE_PUBLIC_STELLAR_NETWORK === "STANDALONE"
    ? "LOCAL"
    : env.VITE_PUBLIC_STELLAR_NETWORK;
export const networkPassphrase = env.VITE_PUBLIC_STELLAR_NETWORK_PASSPHRASE;

// NOTE: needs to be exported for contract files in this directory
export const rpcUrl = env.VITE_PUBLIC_STELLAR_RPC_URL;

export const horizonUrl = env.VITE_PUBLIC_STELLAR_HORIZON_URL;

const networkToId = (network: string): NetworkType => {
  switch (network) {
    case "PUBLIC":
      return "mainnet";
    case "TESTNET":
      return "testnet";
    case "FUTURENET":
      return "futurenet";
    default:
      return "custom";
  }
};

export const network: Network = {
  id: networkToId(stellarNetwork),
  label: stellarNetwork.toLowerCase(),
  passphrase: networkPassphrase,
  rpcUrl: rpcUrl,
  horizonUrl: horizonUrl,
};
