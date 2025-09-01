import {
  Contract,
  rpc,
  TransactionBuilder,
  Address,
  nativeToScVal,
  scValToNative,
  Memo,
} from "@stellar/stellar-sdk";
import { getNetwork, getAccount, simulateTransaction } from "./stellar";
import { kaleContractId } from "./env";

// KALE token has 7 decimal places
export const KALE_DECIMALS = 7;
export const KALE_UNIT = Math.pow(10, KALE_DECIMALS);

// Convert human-readable amount to stroops (smallest unit)
export const toKaleStroops = (amount: string | number): bigint => {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return BigInt(Math.round(numAmount * KALE_UNIT));
};

// Convert stroops to human-readable amount
export const fromKaleStroops = (stroops: bigint): number => {
  return Number(stroops) / KALE_UNIT;
};

export interface TransferParams {
  fromPubKey: string;
  toPubKey: string;
  amount: string;
  memo?: string;
}

export const buildTransferXdr = async ({
  fromPubKey,
  toPubKey,
  amount,
  memo,
}: TransferParams): Promise<string> => {
  try {
    console.log("Building transfer XDR with params:", { fromPubKey, toPubKey, amount, memo });
    console.log("KALE Contract ID:", kaleContractId);
    
    // Get the source account
    const sourceAccount = await getAccount(fromPubKey);
    
    // Create contract instance
    const contract = new Contract(kaleContractId);
    
    // Convert amount to stroops
    const amountStroops = toKaleStroops(amount);
    
    // Build the transfer operation
    // For Soroban Asset Contract (SAC), try different function names
    const transferOp = contract.call(
      "transfer",  // Standard token interface
      Address.fromString(fromPubKey).toScVal(),
      Address.fromString(toPubKey).toScVal(),
      nativeToScVal(amountStroops, { type: "i128" })
    );
    
    // Build the transaction
    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: "100000", // 0.01 XLM base fee
      networkPassphrase: getNetwork(),
    });
    
    txBuilder.addOperation(transferOp);
    
    // Add memo if provided
    if (memo) {
      txBuilder.addMemo(Memo.text(memo));
    }
    
    // Set timeout to 5 minutes
    txBuilder.setTimeout(300);
    
    const transaction = txBuilder.build();
    
    // Simulate the transaction to get the footprint
    const simulation = await simulateTransaction(transaction);
    
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }
    
    if (!simulation.result) {
      throw new Error("Simulation failed: no result");
    }
    
    // Assemble the transaction with the footprint
    const assembledTx = rpc.assembleTransaction(transaction, simulation);
    
    return assembledTx.build().toXDR();
  } catch (error) {
    console.error("Error building transfer XDR:", error);
    throw error;
  }
};

// Helper to get KALE balance for an address
export const getKaleBalance = async (address: string): Promise<number> => {
  try {
    const contract = new Contract(kaleContractId);
    const sourceAccount = await getAccount(address);
    
    const balanceOp = contract.call(
      "balance",
      Address.fromString(address).toScVal()
    );
    
    const txBuilder = new TransactionBuilder(sourceAccount, {
      fee: "100000",
      networkPassphrase: getNetwork(),
    });
    
    txBuilder.addOperation(balanceOp);
    txBuilder.setTimeout(300);
    
    const transaction = txBuilder.build();
    const simulation = await simulateTransaction(transaction);
    
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Balance query failed: ${simulation.error}`);
    }
    
    if (!simulation.result?.retval) {
      return 0;
    }
    
    const balance = scValToNative(simulation.result.retval);
    return fromKaleStroops(BigInt(balance));
  } catch (error) {
    console.error("Error getting KALE balance:", error);
    return 0;
  }
};
