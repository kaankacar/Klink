import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout, Text, Alert, Loader, Button, Card, Icon } from "@stellar/design-system";
import { SocialPreview } from "../components/SocialPreview";
import { buildTransferXdr } from "../lib/kale";
import { createPasskeyAccount, signWithPasskey, PasskeyAccount } from "../lib/passkey";
import { submitTransaction } from "../lib/submit";

interface AirdropData {
  from: string;
  amount: string;
  memo?: string;
  maxClaims?: number;
}

const PasskeyAirdrop: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [airdropData, setAirdropData] = useState<AirdropData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [, setPasskeyAccount] = useState<PasskeyAccount | null>(null);
  const [claimResult, setClaimResult] = useState<{ success: boolean; txHash?: string; error?: string } | null>(null);

  // Load airdrop data from URL parameters
  useEffect(() => {
    try {
      const from = searchParams.get("from");
      const amount = searchParams.get("amount");
      const memo = searchParams.get("memo") || undefined;
      const maxClaims = searchParams.get("maxClaims");

      if (!from || !amount) {
        setError("Invalid airdrop link - missing required parameters");
        return;
      }

      if (!from.match(/^G[A-Z2-7]{55}$/)) {
        setError("Invalid sender address format");
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Invalid airdrop amount");
        return;
      }

      const data: AirdropData = {
        from,
        amount,
        memo,
        maxClaims: maxClaims ? parseInt(maxClaims) : undefined,
      };

      setAirdropData(data);
      setError(null);
    } catch (err) {
      setError("Invalid airdrop parameters");
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleCreateWallet = async () => {
    if (!airdropData) return;

    try {
      setIsCreatingWallet(true);
      setError(null);

      // Create passkey account (this will prompt for Face ID, Touch ID, etc.)
      const account = await createPasskeyAccount("KALE Links", "airdrop-user");
      setPasskeyAccount(account);
      
      // Automatically start claiming process
      await handleClaim(account);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create wallet");
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const handleClaim = async (account: PasskeyAccount) => {
    if (!airdropData) return;

    try {
      setIsClaiming(true);
      setError(null);

      // Build the transfer transaction
      const xdr = await buildTransferXdr({
        fromPubKey: airdropData.from,
        toPubKey: account.contractId, // Smart wallet contract address
        amount: airdropData.amount,
        memo: airdropData.memo,
      });

      // Sign with passkey
      const signedXdr = await signWithPasskey(xdr);

      // Submit the transaction
      const result = await submitTransaction(signedXdr);

      if (result.success && result.hash) {
        setClaimResult({
          success: true,
          txHash: result.hash,
        });
      } else {
        setClaimResult({
          success: false,
          error: result.error || "Transaction failed",
        });
      }
    } catch (err) {
      setClaimResult({
        success: false,
        error: err instanceof Error ? err.message : "Failed to claim tokens",
      });
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SocialPreview />
        <Layout.Content>
          <Layout.Inset>
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader size="lg" />
              <Text as="span" size="md" style={{ marginLeft: "1rem" }}>
                Loading airdrop...
              </Text>
            </div>
          </Layout.Inset>
        </Layout.Content>
      </>
    );
  }

  if (error && !airdropData) {
    return (
      <>
        <SocialPreview />
        <Layout.Content>
          <Layout.Inset>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0", textAlign: "center" }}>
              <Icon.AlertTriangle size="lg" color="error" style={{ marginBottom: "1rem" }} />
              <Alert variant="error" placement="inline">
                <Text as="h3" size="lg" weight="medium">Airdrop Unavailable</Text>
                <Text as="p" size="md">{error}</Text>
              </Alert>

              <Button
                variant="secondary"
                size="md"
                onClick={() => navigate("/")}
                style={{ marginTop: "1rem" }}
              >
                Create Your Own Airdrop
              </Button>
            </div>
          </Layout.Inset>
        </Layout.Content>
      </>
    );
  }

  if (!airdropData) {
    return null;
  }

  // Show claim result
  if (claimResult) {
    return (
      <>
        <SocialPreview airdropData={airdropData} />
        <Layout.Content>
          <Layout.Inset>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
              <Card>
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  {claimResult.success ? (
                    <>
                      <Icon.CheckCircle size="lg" color="success" style={{ marginBottom: "1rem" }} />
                      <Text as="h2" size="xl" weight="bold" style={{ marginBottom: "1rem" }}>
                        🎉 KALE Claimed Successfully!
                      </Text>
                      <Text as="p" size="md" color="secondary" style={{ marginBottom: "1.5rem" }}>
                        Your {airdropData.amount} KALE tokens have been transferred to your smart wallet.
                      </Text>
                      
                      {claimResult.txHash && (
                        <div style={{ marginBottom: "1.5rem" }}>
                          <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                            Transaction Hash:
                          </Text>
                          <Text as="p" size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                            {claimResult.txHash}
                          </Text>
                        </div>
                      )}

                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/")}
                      >
                        Create Your Own Airdrop
                      </Button>
                    </>
                  ) : (
                    <>
                      <Icon.AlertTriangle size="lg" color="error" style={{ marginBottom: "1rem" }} />
                      <Text as="h2" size="xl" weight="bold" style={{ marginBottom: "1rem" }}>
                        Claim Failed
                      </Text>
                      <Text as="p" size="md" color="secondary" style={{ marginBottom: "1.5rem" }}>
                        {claimResult.error}
                      </Text>
                      
                      <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={() => {
                            setClaimResult(null);
                            setError(null);
                          }}
                        >
                          Try Again
                        </Button>
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => navigate("/")}
                        >
                          Create Your Own Airdrop
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>
          </Layout.Inset>
        </Layout.Content>
      </>
    );
  }

  return (
    <>
      <SocialPreview airdropData={airdropData} />
      <Layout.Content>
        <Layout.Inset>
          <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
            <div style={{ marginBottom: "2rem", textAlign: "center" }}>
              <Text as="h1" size="xl" weight="bold">🎁 Free KALE Airdrop!</Text>
              <Text as="p" size="md" color="secondary" style={{ marginTop: "0.5rem" }}>
                Create a secure smart wallet with your fingerprint, Face ID, or device PIN to claim your tokens.
              </Text>
            </div>

            <Card>
              <div style={{ padding: "2rem" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "1rem"
                }}>
                  <Icon.Gift01 size="md" />
                  <Text as="h3" size="lg" weight="medium">Claim Details</Text>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                  <div>
                    <Text as="span" size="sm" weight="medium" color="secondary">
                      Amount
                    </Text>
                    <Text as="p" size="md" weight="medium">{airdropData.amount} KALE</Text>
                  </div>

                  {airdropData.memo && (
                    <div>
                      <Text as="span" size="sm" weight="medium" color="secondary">
                        Memo
                      </Text>
                      <Text as="p" size="md" weight="medium">{airdropData.memo}</Text>
                    </div>
                  )}

                  <div>
                    <Text as="span" size="sm" weight="medium" color="secondary">
                      From
                    </Text>
                    <Text as="p" size="sm" style={{ fontFamily: "monospace" }}>
                      {airdropData.from.slice(0, 8)}...{airdropData.from.slice(-8)}
                    </Text>
                  </div>

                  {airdropData.maxClaims && (
                    <div>
                      <Text as="span" size="sm" weight="medium" color="secondary">
                        Limited Airdrop
                      </Text>
                      <Text as="p" size="md">
                        Max {airdropData.maxClaims} claims available
                      </Text>
                    </div>
                  )}
                </div>

                <div style={{ 
                  background: "#f0f9ff", 
                  padding: "1.5rem", 
                  borderRadius: "8px",
                  marginBottom: "1.5rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
                    <Icon.Shield01 size="md" />
                    <Text as="h4" size="md" weight="medium">Smart Wallet Technology</Text>
                  </div>
                  <Text as="p" size="sm" color="secondary">
                    No wallet extension needed! We'll create a secure smart wallet protected by your device's 
                    biometric authentication (Face ID, Touch ID, Windows Hello, etc.). Your tokens will be 
                    stored safely on the Stellar network.
                  </Text>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCreateWallet}
                  disabled={isCreatingWallet || isClaiming}
                  style={{ width: "100%" }}
                >
                  {isCreatingWallet ? (
                    <>
                      <Loader size="sm" />
                      Creating Smart Wallet...
                    </>
                  ) : isClaiming ? (
                    <>
                      <Loader size="sm" />
                      Claiming Tokens...
                    </>
                  ) : (
                    <>
                      <Icon.Fingerprint01 size="md" />
                      Claim with Smart Wallet
                    </>
                  )}
                </Button>

                {error && (
                  <div style={{ marginTop: "1rem" }}>
                    <Alert variant="error" placement="inline">
                      {error}
                    </Alert>
                  </div>
                )}
              </div>
            </Card>

            <div style={{ marginTop: "2rem", textAlign: "center" }}>
              <Text as="p" size="sm" color="secondary">
                🔐 Secured by Passkeys • 🌟 Powered by Stellar • 🥬 KALE Token
              </Text>
            </div>
          </div>
        </Layout.Inset>
      </Layout.Content>
    </>
  );
};

export default PasskeyAirdrop;
