import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Text, Alert, Loader, Button, Card, Icon } from "@stellar/design-system";
import { SocialPreview } from "../components/SocialPreview";
import { buildTransferXdr } from "../lib/kale";
import { useWallet } from "../hooks/useWallet";

interface AirdropData {
  from: string;
  amount: string;
  memo?: string;
  maxClaims?: number;
}

const Airdrop: React.FC = () => {
  console.log("Airdrop component rendering...");
  
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [airdropData, setAirdropData] = useState<AirdropData | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const { address: connectedWallet } = useWallet();

  // Load airdrop data from URL parameters
  useEffect(() => {
    console.log("Airdrop page loading...");
    console.log("URL search params:", window.location.search);
    
    try {
      const from = searchParams.get("from");
      const amount = searchParams.get("amount");
      const memo = searchParams.get("memo") || undefined;
      const maxClaims = searchParams.get("maxClaims");

      console.log("Parsed params:", { from, amount, memo, maxClaims });

      if (!from || !amount) {
        console.log("Missing required parameters");
        setError("Invalid airdrop link - missing required parameters");
        return;
      }

      // Basic validation
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
    }
  }, [searchParams]);

  // Auto-redirect to wallet when user connects
  useEffect(() => {
    const redirectToWallet = async () => {
      if (!airdropData || !connectedWallet || isRedirecting) return;
      
      try {
        setIsRedirecting(true);
        
        // Build the transfer XDR
        const xdr = await buildTransferXdr({
          fromPubKey: airdropData.from,
          toPubKey: connectedWallet,
          amount: airdropData.amount,
          memo: airdropData.memo,
        });

        // Create SEP-7 deep link
        const sep7Url = `web+stellar:tx?xdr=${encodeURIComponent(xdr)}&origin_domain=${encodeURIComponent(window.location.hostname)}`;
        
        // Redirect to wallet
        window.location.href = sep7Url;
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create wallet link");
        setIsRedirecting(false);
      }
    };

    // Small delay to show the page briefly before redirecting
    const timer = setTimeout(redirectToWallet, 1500);
    return () => clearTimeout(timer);
  }, [airdropData, connectedWallet, isRedirecting]);

  if (error) {
    return (
      <>
        <SocialPreview />
        <Layout.Content>
          <Layout.Inset>
            <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0", textAlign: "center" }}>
              <Alert variant="error" placement="inline">
                <Text as="h3" size="lg" weight="medium">Airdrop Unavailable</Text>
                <Text as="p" size="md">{error}</Text>
              </Alert>
              
              <Button
                variant="secondary"
                size="md"
                onClick={() => window.location.href = "/"}
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
    return (
      <>
        <SocialPreview />
        <Layout.Content>
          <Layout.Inset>
            <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
              <Loader size="lg" />
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
                {connectedWallet ? "Redirecting to your wallet..." : "Connect your wallet to claim"}
              </Text>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              {/* Airdrop Preview */}
              <Card>
                <div style={{ padding: "1.5rem" }}>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "0.5rem",
                    marginBottom: "1rem"
                  }}>
                    <Icon.Gift01 size="md" />
                    <Text as="h3" size="lg" weight="medium">Claim Details</Text>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div>
                      <Text as="span" size="sm" weight="medium" color="secondary">
                        You'll Receive
                      </Text>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                        <Text as="span" size="xl" weight="bold" color="primary">
                          {airdropData.amount}
                        </Text>
                        <Text as="span" size="md" weight="medium" color="secondary">
                          KALE
                        </Text>
                      </div>
                    </div>
                    
                    {airdropData.memo && (
                      <div>
                        <Text as="span" size="sm" weight="medium" color="secondary">
                          Message
                        </Text>
                        <Text as="p" size="md">
                          "{airdropData.memo}"
                        </Text>
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
                </div>
              </Card>

              {/* Status */}
              {isRedirecting ? (
                <Card>
                  <div style={{ 
                    padding: "1.5rem", 
                    textAlign: "center",
                    background: "#f0f9ff"
                  }}>
                    <Loader size="md" />
                    <Text as="p" size="md" style={{ marginTop: "1rem" }}>
                      Opening your wallet app...
                    </Text>
                    <Text as="p" size="sm" color="secondary" style={{ marginTop: "0.5rem" }}>
                      If your wallet doesn't open automatically, try clicking the link again.
                    </Text>
                  </div>
                </Card>
              ) : !connectedWallet ? (
                <Card>
                  <div style={{ padding: "1.5rem", textAlign: "center" }}>
                    <Icon.Wallet01 size="lg" style={{ marginBottom: "1rem" }} />
                    <Text as="h3" size="lg" weight="medium" style={{ marginBottom: "0.5rem" }}>
                      Connect Your Wallet
                    </Text>
                    <Text as="p" size="md" color="secondary" style={{ marginBottom: "1.5rem" }}>
                      Connect your Stellar wallet to claim your KALE tokens
                    </Text>
                    
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        // Redirect to home page to connect wallet
                        window.location.href = "/?connect=true";
                      }}
                    >
                      Connect Wallet
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <div style={{ 
                    padding: "1.5rem", 
                    textAlign: "center",
                    background: "#f0fdf4"
                  }}>
                    <Icon.CheckCircle size="lg" color="success" style={{ marginBottom: "1rem" }} />
                    <Text as="h3" size="lg" weight="medium" style={{ marginBottom: "0.5rem" }}>
                      Wallet Connected!
                    </Text>
                    <Text as="p" size="md" color="secondary">
                      Preparing your KALE claim...
                    </Text>
                  </div>
                </Card>
              )}

              {/* Manual Wallet Link */}
              <Card>
                <div style={{ padding: "1rem", background: "#fef3c7", textAlign: "center" }}>
                  <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                    💡 Pro Tip:
                  </Text>
                  <Text as="p" size="sm" color="secondary">
                    This link will automatically open your connected Stellar wallet with the transaction ready to sign.
                    Just approve it to receive your KALE tokens!
                  </Text>
                </div>
              </Card>
            </div>
          </div>
        </Layout.Inset>
      </Layout.Content>
    </>
  );
};

export default Airdrop;
