import { TransactionBuilder } from "@stellar/stellar-sdk";
import { submitTransaction, pollTransactionStatus, getTransactionUrl, getNetwork } from "./stellar";

export interface SubmissionResult {
  success: boolean;
  hash?: string;
  explorerUrl?: string;
  error?: string;
}

export const submitAndPollTransaction = async (
  signedXdr: string
): Promise<SubmissionResult> => {
  try {
    // Parse the signed transaction
    const transaction = TransactionBuilder.fromXDR(signedXdr, getNetwork());
    
    // Submit the transaction
    const submitResponse = await submitTransaction(transaction);
    
    if (submitResponse.status === "ERROR") {
      return {
        success: false,
        error: `Transaction submission failed: ${submitResponse.errorResult}`,
      };
    }
    
    const hash = submitResponse.hash;
    
    // Poll for transaction completion
    try {
      const finalResponse = await pollTransactionStatus(hash);
      
      if (finalResponse.status === "SUCCESS") {
        return {
          success: true,
          hash,
          explorerUrl: getTransactionUrl(hash),
        };
      } else {
        return {
          success: false,
          hash,
          explorerUrl: getTransactionUrl(hash),
          error: `Transaction failed: ${finalResponse.status}`,
        };
      }
    } catch (pollError) {
      // Even if polling fails, we have the hash
      return {
        success: false,
        hash,
        explorerUrl: getTransactionUrl(hash),
        error: "Transaction status unknown - check explorer link",
      };
    }
  } catch (error) {
    console.error("Transaction submission error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
};
