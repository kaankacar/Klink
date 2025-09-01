import React, { useState } from "react";
import { Button, Card, Text, Icon, Alert } from "@stellar/design-system";
import * as freighter from "@stellar/freighter-api";
import { connectWallet } from "../util/wallet";
import { useAppStore } from "../lib/store";
import { getNetwork } from "../lib/stellar";

interface WalletChooserProps {
  xdr: string;
  onSigned: (signedXdr: string) => void;
}

export const WalletChooser: React.FC<WalletChooserProps> = ({ 
  xdr, 
  onSigned 
}) => {
  const {
    connectedWallet,
    walletType,
    isConnecting,
    isSigning,
    setConnectedWallet,
    setConnecting,
    setSigning,
  } = useAppStore();
  
  const [error, setError] = useState<string | null>(null);

  const handleFreighterConnect = async () => {
    try {
      setError(null);
      setConnecting(true);
      
      const connected = await freighter.isConnected();
      if (!connected) {
        throw new Error("Freighter is not installed or not connected");
      }
      
      const result = await freighter.requestAccess();
      if (result.error) {
        throw new Error(result.error);
      }
      const publicKey = result.address;
      setConnectedWallet(publicKey, "freighter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect to Freighter");
    } finally {
      setConnecting(false);
    }
  };

  const handleWalletKitConnect = async () => {
    try {
      setError(null);
      setConnecting(true);
      
      await connectWallet();
      // The wallet connection will be handled by the existing wallet provider
      // For now, we'll just indicate that wallet kit was used
      setConnectedWallet("wallet-kit", "wallets-kit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet");
    } finally {
      setConnecting(false);
    }
  };

  const handleFreighterSign = async () => {
    try {
      setError(null);
      setSigning(true);
      
      const networkPassphrase = getNetwork();
      const signedXdr = await freighter.signTransaction(xdr, {
        networkPassphrase,
      });
      
      onSigned(signedXdr.signedTxXdr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign transaction");
    } finally {
      setSigning(false);
    }
  };

  const handleWalletKitSign = async () => {
    try {
      setError(null);
      setSigning(true);
      
      // Use the existing wallet utility for signing
      const { wallet } = await import("../util/wallet");
      const signedXdr = await wallet.signTransaction(xdr);
      
      onSigned(signedXdr.signedTxXdr);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to sign transaction");
    } finally {
      setSigning(false);
    }
  };

  if (!connectedWallet) {
    return (
      <Card>
        <div style={{ padding: "1.5rem" }}>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.5rem",
            marginBottom: "1rem"
          }}>
            <Icon.Wallet01 size="md" />
            <Text as="h3" size="lg" weight="medium">Choose Wallet</Text>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Button
              size="lg"
              variant="primary"
              onClick={handleFreighterConnect}
              disabled={isConnecting}
              style={{ width: "100%" }}
            >
              <Icon.Wallet01 size="md" />
              {isConnecting ? "Connecting..." : "Freighter Wallet"}
            </Button>
            
            <Button
              size="lg"
              variant="secondary"
              onClick={handleWalletKitConnect}
              disabled={isConnecting}
              style={{ width: "100%" }}
            >
              <Icon.Grid01 size="md" />
              {isConnecting ? "Connecting..." : "Other Wallets"}
            </Button>
          </div>
          
          {error && (
            <Alert variant="error" placement="inline">
              {error}
            </Alert>
          )}
          
          <Text as="p" size="sm" color="secondary" style={{ marginTop: "1rem", textAlign: "center" }}>
            Connect your wallet to sign and submit the transaction
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: "1.5rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          <Icon.CheckCircle size="md" color="success" />
          <Text as="h3" size="lg" weight="medium">Wallet Connected</Text>
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <Text as="span" size="sm" weight="medium" color="secondary">
            Connected Address
          </Text>
          <Text as="p" size="md" weight="medium" title={connectedWallet}>
            {`${connectedWallet.slice(0, 8)}...${connectedWallet.slice(-8)}`}
          </Text>
        </div>
        
        <Button
          size="lg"
          variant="primary"
          onClick={walletType === "freighter" ? handleFreighterSign : handleWalletKitSign}
          disabled={isSigning}
          style={{ width: "100%" }}
        >
          <Icon.Edit01 size="md" />
          {isSigning ? "Signing..." : "Sign Transaction"}
        </Button>
        
        {error && (
          <Alert variant="error" placement="inline">
            {error}
          </Alert>
        )}
      </div>
    </Card>
  );
};
