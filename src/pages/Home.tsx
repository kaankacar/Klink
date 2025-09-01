import React, { useState } from "react";
import { Layout, Text, Input, Button, Card, Icon, Alert } from "@stellar/design-system";
import { SocialPreview } from "../components/SocialPreview";
import { useWallet } from "../hooks/useWallet";

const Home: React.FC = () => {
  const { address: connectedWallet } = useWallet();
  const [formData, setFormData] = useState({
    amount: "",
    memo: "",
    maxClaims: "",
  });
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleGenerateLink = () => {
    try {
      // Simple validation
      if (!formData.amount) {
        throw new Error("Please fill in the amount to airdrop");
      }
      
      const amount = parseFloat(formData.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const maxClaims = formData.maxClaims ? parseInt(formData.maxClaims) : undefined;
      if (maxClaims && (isNaN(maxClaims) || maxClaims <= 0)) {
        throw new Error("Max claims must be a positive number");
      }
      
      if (!connectedWallet) {
        throw new Error("Please connect your wallet first");
      }
      
                    // Create shareable link with all parameters in URL (using passkey airdrop)
              const url = new URL(`/passkey-airdrop`, window.location.origin);
              url.searchParams.set("from", connectedWallet);
              url.searchParams.set("amount", formData.amount);
              if (formData.memo) {
                url.searchParams.set("memo", formData.memo);
              }
              if (maxClaims) {
                url.searchParams.set("maxClaims", maxClaims.toString());
              }
      
      setGeneratedLink(url.toString());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid input");
      setGeneratedLink(null);
    }
  };

  const handleCopyLink = async () => {
    if (!generatedLink) return;
    
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = generatedLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReset = () => {
    setFormData({ amount: "", memo: "", maxClaims: "" });
    setGeneratedLink(null);
    setError(null);
    setCopied(false);
  };
  return (
    <>
      <SocialPreview isHomePage={true} />
  <Layout.Content>
    <Layout.Inset>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <Text as="h1" size="xl" weight="bold" style={{ 
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              marginBottom: "1rem",
              display: "block"
            }}>
              🥬 KALE Links
            </Text>
            <Text as="p" size="lg" color="secondary">
              Create airdrop links for people to claim KALE tokens from your wallet
            </Text>
          </div>

          {!connectedWallet ? (
            /* Wallet Connection Prompt */
            <Card>
              <div style={{ padding: "2rem", textAlign: "center" }}>
                <Icon.Wallet01 size="lg" style={{ marginBottom: "1rem" }} />
                <Text as="h3" size="lg" weight="medium" style={{ marginBottom: "1rem" }}>
                  Connect Your Wallet
                </Text>
                <Text as="p" size="md" color="secondary" style={{ marginBottom: "1.5rem" }}>
                  Please connect your wallet using the button in the top-right corner to create airdrop links.
                  People will claim KALE tokens directly from your connected wallet.
                </Text>
                <Alert variant="primary" placement="inline">
                  <Text as="span" size="sm">
                    👆 Look for the "Connect Account" button in the header above
                  </Text>
                </Alert>
              </div>
            </Card>
          ) : !generatedLink ? (
            /* Link Generator Form */
            <Card>
              <div style={{ padding: "2rem" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <Icon.Link01 size="md" />
                  <Text as="h3" size="lg" weight="medium">Create Airdrop Link</Text>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  <div>
                    <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                      Amount per Claim *
                    </Text>
                    <Input
                      id="amount"
                      fieldSize="md"
                      type="number"
                      placeholder="5.0"
                      step="0.0000001"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange("amount", e.target.value)}
                      style={{ width: "100%" }}
                    />
                    <Text as="span" size="xs" color="secondary" style={{ marginTop: "0.25rem", display: "block" }}>
                      Amount of KALE tokens each person can claim
                    </Text>
                  </div>

                  <div>
                    <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                      Max Claims (Optional)
                    </Text>
                    <Input
                      id="maxClaims"
                      fieldSize="md"
                      type="number"
                      placeholder="100"
                      min="1"
                      value={formData.maxClaims}
                      onChange={(e) => handleInputChange("maxClaims", e.target.value)}
                      style={{ width: "100%" }}
                    />
                    <Text as="span" size="xs" color="secondary" style={{ marginTop: "0.25rem", display: "block" }}>
                      Maximum number of people who can claim (leave empty for unlimited)
                    </Text>
                  </div>

                  <div>
                    <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                      Memo (Optional)
                    </Text>
                    <Input
                      id="memo"
                      fieldSize="md"
                      type="text"
                      placeholder="Free KALE airdrop!"
                      maxLength={28}
                      value={formData.memo}
                      onChange={(e) => handleInputChange("memo", e.target.value)}
                      style={{ width: "100%" }}
                    />
                    <Text as="span" size="xs" color="secondary" style={{ marginTop: "0.25rem", display: "block" }}>
                      Optional message for the airdrop (max 28 characters)
                    </Text>
                  </div>

                  <Button
                    size="lg"
                    variant="primary"
                    onClick={handleGenerateLink}
                    disabled={!formData.amount}
                    style={{ width: "100%" }}
                  >
                    <Icon.Link01 size="md" />
                    Create Airdrop Link
                  </Button>
                </div>

                {error && (
                  <div style={{ marginTop: "1rem" }}>
                    <Alert variant="error" placement="inline">
                      {error}
                    </Alert>
                  </div>
                )}
              </div>
            </Card>
          ) : (
            /* Generated Link Display */
            <Card>
              <div style={{ padding: "2rem" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "0.5rem",
                  marginBottom: "1.5rem"
                }}>
                  <Icon.CheckCircle size="md" color="success" />
                  <Text as="h3" size="lg" weight="medium">Airdrop Link Created!</Text>
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <Text as="span" size="sm" weight="medium" color="secondary" style={{ marginBottom: "0.5rem", display: "block" }}>
                    Your KALE airdrop link:
                  </Text>
                  <div style={{ 
                    background: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    fontFamily: "monospace",
                    fontSize: "14px",
                    wordBreak: "break-all",
                    marginBottom: "1rem"
                  }}>
                    {generatedLink}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <Button
                    size="md"
                    variant="primary"
                    onClick={handleCopyLink}
                    style={{ flex: 1 }}
                  >
                    <Icon.Copy01 size="sm" />
                    {copied ? "Copied!" : "Copy Link"}
                  </Button>
                  
                  <Button
                    size="md"
                    variant="secondary"
                    onClick={handleReset}
                    style={{ flex: 1 }}
                  >
                    <Icon.ArrowLeft size="sm" />
                    Create Another
                  </Button>
                </div>

                <div style={{ marginTop: "1.5rem", padding: "1rem", background: "#f0f9ff", borderRadius: "8px" }}>
                  <Text as="span" size="sm" weight="medium" style={{ marginBottom: "0.5rem", display: "block" }}>
                    💡 How to use:
                  </Text>
                  <Text as="p" size="sm" color="secondary">
                    Share this airdrop link on X (Twitter) or any social platform. When people click it, 
                    they can connect their wallet and claim KALE tokens directly from your wallet!
                  </Text>
                </div>
              </div>
            </Card>
          )}

          {/* Info Section */}
          <div style={{ marginTop: "3rem", textAlign: "center" }}>
            <Text as="p" size="sm" color="secondary">
              🌟 Powered by Stellar Testnet • 🥬 KALE Token • 🎁 Airdrop Links
            </Text>
          </div>
        </div>
    </Layout.Inset>
  </Layout.Content>
    </>
);
};

export default Home;
