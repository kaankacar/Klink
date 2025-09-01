import { create } from "zustand";
import { SendParams } from "./validation";
import { SubmissionResult } from "./submit";

export type WalletType = "freighter" | "wallets-kit";

interface AppState {
  // Send page state
  params: SendParams | null;
  xdr: string | null;
  connectedWallet: string | null;
  walletType: WalletType | null;
  isConnecting: boolean;
  isBuilding: boolean;
  isSigning: boolean;
  isSubmitting: boolean;
  submissionResult: SubmissionResult | null;
  
  // Actions
  setParams: (params: SendParams) => void;
  setXdr: (xdr: string) => void;
  setConnectedWallet: (wallet: string, type: WalletType) => void;
  setConnecting: (connecting: boolean) => void;
  setBuilding: (building: boolean) => void;
  setSigning: (signing: boolean) => void;
  setSubmitting: (submitting: boolean) => void;
  setSubmissionResult: (result: SubmissionResult) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  params: null,
  xdr: null,
  connectedWallet: null,
  walletType: null,
  isConnecting: false,
  isBuilding: false,
  isSigning: false,
  isSubmitting: false,
  submissionResult: null,
  
  // Actions
  setParams: (params) => set({ params }),
  setXdr: (xdr) => set({ xdr }),
  setConnectedWallet: (wallet, type) => 
    set({ connectedWallet: wallet, walletType: type }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setBuilding: (building) => set({ isBuilding: building }),
  setSigning: (signing) => set({ isSigning: signing }),
  setSubmitting: (submitting) => set({ isSubmitting: submitting }),
  setSubmissionResult: (result) => set({ submissionResult: result }),
  reset: () => set({
    params: null,
    xdr: null,
    connectedWallet: null,
    walletType: null,
    isConnecting: false,
    isBuilding: false,
    isSigning: false,
    isSubmitting: false,
    submissionResult: null,
  }),
}));
