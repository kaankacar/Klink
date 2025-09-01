import { PasskeyKit } from "passkey-kit";
import { rpcUrl, networkPassphrase } from "./env";

// Initialize PasskeyKit without walletWasmHash to use the default
// The fake hash was causing XDR encoding errors (34 bytes vs 32 expected)
export const passkeyKit = new PasskeyKit({
  rpcUrl,
  networkPassphrase,
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
    console.log("Creating passkey account with:", { app, user, rpcUrl, networkPassphrase });
    
    // This will prompt the user to create a passkey (Face ID, Touch ID, etc.)
    const account = await passkeyKit.createWallet(app, user);
    
    console.log("Passkey account created successfully:", account);
    
    return {
      contractId: account.contractId,
      keyId: account.keyIdBase64,
    };
  } catch (error) {
    console.error("Failed to create passkey account - detailed error:", error);
    
    // Provide more specific error messages based on common issues
    if (error instanceof Error) {
      if (error.message.includes("XDR")) {
        throw new Error("Configuration error: Invalid network settings. Please try again or contact support.");
      } else if (error.message.includes("User cancelled") || error.message.includes("NotAllowedError")) {
        throw new Error("Passkey creation was cancelled. Please try again and allow the passkey creation.");
      } else if (error.message.includes("NotSupportedError")) {
        throw new Error("Passkeys are not supported on this device or browser. Please use a compatible device.");
      } else {
        throw new Error(`Failed to create passkey account: ${error.message}`);
      }
    }
    
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
