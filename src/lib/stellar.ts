import {
  rpc,
  Networks,
} from "@stellar/stellar-sdk";
import { env, networkPassphrase, rpcUrl, explorerBase } from "./env";

export const server = new rpc.Server(rpcUrl, { allowHttp: true });

export const getNetwork = () => {
  switch (env.VITE_PUBLIC_STELLAR_NETWORK) {
    case "PUBLIC":
      return Networks.PUBLIC;
    case "TESTNET":
      return Networks.TESTNET;
    case "FUTURENET":
      return Networks.FUTURENET;
    default:
      return networkPassphrase;
  }
};

export const getAccount = async (publicKey: string) => {
  return await server.getAccount(publicKey);
};

export const simulateTransaction = async (transaction: any) => {
  return await server.simulateTransaction(transaction);
};

export const submitTransaction = async (transaction: any) => {
  return await server.sendTransaction(transaction);
};

export const pollTransactionStatus = async (
  hash: string,
  maxAttempts = 30,
  delay = 1000
): Promise<rpc.Api.GetTransactionResponse> => {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await server.getTransaction(hash);
    
    if (response.status === "SUCCESS" || response.status === "FAILED") {
      return response;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw new Error("Transaction polling timeout");
};

// Helper to get transaction URL for Stellar Expert
export const getTransactionUrl = (hash: string) => {
  return `${explorerBase}/tx/${hash}`;
};
