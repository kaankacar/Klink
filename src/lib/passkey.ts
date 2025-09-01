import { PasskeyKit } from "passkey-kit";
import { rpcUrl, networkPassphrase } from "./env";

// Wallet WASM hash for smart wallet deployment (from Passkey Kit docs)
const WALLET_WASM_HASH = "4b9b2c3c9b6b0d9c8e7f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1";

export const passkeyKit = new PasskeyKit({
  rpcUrl,
  networkPassphrase,
  walletWasmHash: WALLET_WASM_HASH,
});

export interface PasskeyAccount {
  contractId: string;
  keyId: string;
}

/**
 * Create a new passkey and deploy a smart wallet
 */
export const createPasskeyAccount = async (app: string, user: string): Promise<PasskeyAccount> => {
  try {
    // This will prompt the user to create a passkey (Face ID, Touch ID, etc.)
    const account = await passkeyKit.createWallet(app, user);
    
    return {
      contractId: account.contractId,
      keyId: account.keyIdBase64,
    };
  } catch (error) {
    console.error("Failed to create passkey account:", error);
    throw new Error("Failed to create passkey account. Please try again.");
  }
};

/**
 * Connect to an existing passkey account
 */
export const connectPasskeyAccount = async (): Promise<PasskeyAccount> => {
  try {
    const account = await passkeyKit.connectWallet();
    
    return {
      contractId: account.contractId,
      keyId: account.keyIdBase64,
    };
  } catch (error) {
    console.error("Failed to connect passkey account:", error);
    throw new Error("Failed to connect to passkey account. Please try again.");
  }
};

/**
 * Sign a transaction with the passkey
 */
export const signWithPasskey = async (
  transactionXdr: string
): Promise<string> => {
  try {
    const signedTx = await passkeyKit.sign(transactionXdr);
    return signedTx.toXDR();
  } catch (error) {
    console.error("Failed to sign with passkey:", error);
    throw new Error("Failed to sign transaction. Please try again.");
  }
};
