import { z } from "zod";

const envSchema = z.object({
  PUBLIC_STELLAR_NETWORK: z.enum([
    "PUBLIC",
    "FUTURENET", 
    "TESTNET",
    "LOCAL",
  ] as const).default("TESTNET"),
  PUBLIC_STELLAR_NETWORK_PASSPHRASE: z.string().default("Test SDF Network ; September 2015"),
  PUBLIC_STELLAR_RPC_URL: z.string().default("https://soroban-testnet.stellar.org"),
  PUBLIC_STELLAR_HORIZON_URL: z.string().default("https://horizon-testnet.stellar.org"),
  PUBLIC_KALE_CONTRACT_ID: z.string().default("CAAVU2UQJLMZ3GUZFM56KVNHLPA3ZSSNR4VP2U53YBXFD2GI3QLIVHZZ"),
  PUBLIC_ORIGIN_DOMAIN: z.string().default("localhost:5173"),
  NEXT_PUBLIC_RPC_URL: z.string().default("https://soroban-testnet.stellar.org"),
  NEXT_PUBLIC_EXPLORER_BASE: z.string().default("https://stellar.expert/explorer/testnet"),
});

const parsed = envSchema.safeParse(import.meta.env);

export const env: z.infer<typeof envSchema> = parsed.success
  ? parsed.data
  : {
      PUBLIC_STELLAR_NETWORK: "TESTNET",
      PUBLIC_STELLAR_NETWORK_PASSPHRASE: "Test SDF Network ; September 2015",
      PUBLIC_STELLAR_RPC_URL: "https://soroban-testnet.stellar.org",
      PUBLIC_STELLAR_HORIZON_URL: "https://horizon-testnet.stellar.org",
      PUBLIC_KALE_CONTRACT_ID: "CAAVU2UQJLMZ3GUZFM56KVNHLPA3ZSSNR4VP2U53YBXFD2GI3QLIVHZZ",
      PUBLIC_ORIGIN_DOMAIN: "localhost:5173",
      NEXT_PUBLIC_RPC_URL: "https://soroban-testnet.stellar.org",
      NEXT_PUBLIC_EXPLORER_BASE: "https://stellar.expert/explorer/testnet",
    };

export const stellarNetwork = env.PUBLIC_STELLAR_NETWORK;
export const networkPassphrase = env.PUBLIC_STELLAR_NETWORK_PASSPHRASE;
export const rpcUrl = env.PUBLIC_STELLAR_RPC_URL;
export const horizonUrl = env.PUBLIC_STELLAR_HORIZON_URL;
export const kaleContractId = env.PUBLIC_KALE_CONTRACT_ID;
export const originDomain = env.PUBLIC_ORIGIN_DOMAIN;
export const nextPublicRpcUrl = env.NEXT_PUBLIC_RPC_URL;
export const explorerBase = env.NEXT_PUBLIC_EXPLORER_BASE;
