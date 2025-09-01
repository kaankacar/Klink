import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Layout, Text, Alert, Loader } from "@stellar/design-system";
import { parseUrlParams } from "../lib/validation";
import { SocialPreview } from "../components/SocialPreview";
import { buildTransferXdr } from "../lib/kale";
import { submitAndPollTransaction } from "../lib/submit";
import { useAppStore } from "../lib/store";
import { ParamPreview } from "../components/ParamPreview";
import { WalletChooser } from "../components/WalletChooser";
import { ActionButtons } from "../components/ActionButtons";
import { TransactionResult } from "../components/TransactionResult";

const Send: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  
  const {
    params,
    xdr,
    connectedWallet,
    isBuilding,
    isSubmitting,
    submissionResult,
    setParams,
    setXdr,
    setBuilding,
    setSubmitting,
    setSubmissionResult,
    reset,
  } = useAppStore();

  // Parse and validate URL parameters on mount
  useEffect(() => {
    try {
      const parsedParams = parseUrlParams(searchParams);
      setParams(parsedParams);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid parameters");
    }
  }, [searchParams, setParams]);

  // Build XDR when wallet is connected and we have valid params
  useEffect(() => {
    const buildXdr = async () => {
      if (!params || !connectedWallet || xdr) return;
      
      try {
        setError(null);
        setBuilding(true);
        
        const builtXdr = await buildTransferXdr({
          fromPubKey: connectedWallet,
          toPubKey: params.to,
          amount: params.amount,
          memo: params.memo,
        });
        
        setXdr(builtXdr);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to build transaction");
      } finally {
        setBuilding(false);
      }
    };

    buildXdr();
  }, [params, connectedWallet, xdr, setXdr, setBuilding]);

  const handleSigned = async (signedXdr: string) => {
    try {
      setError(null);
      setSubmitting(true);
      
      const result = await submitAndPollTransaction(signedXdr);
      setSubmissionResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit transaction");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    reset();
    // Optionally redirect back to home or clear URL params
    window.location.href = "/";
  };

  if (error && !params) {
    return (
      <>
        <SocialPreview />
        <Layout.Content>
          <Layout.Inset>
            <Alert variant="error" placement="inline">
              <Text as="h3" size="lg" weight="medium">Invalid Link</Text>
              <Text as="p" size="md">{error}</Text>
            </Alert>
          </Layout.Inset>
        </Layout.Content>
      </>
    );
  }

  if (!params) {
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
      <SocialPreview params={params} />
      <Layout.Content>
        <Layout.Inset>
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem 0" }}>
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <Text as="h1" size="xl" weight="bold">Send KALE</Text>
            <Text as="p" size="md" color="secondary" style={{ marginTop: "0.5rem" }}>
              Review the transaction details and connect your wallet to proceed
            </Text>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Transaction Preview */}
            <ParamPreview params={params} />

            {/* Show result if transaction is complete */}
            {submissionResult ? (
              <TransactionResult result={submissionResult} onReset={handleReset} />
            ) : (
              <>
                {/* Wallet Connection and Signing */}
                {isBuilding ? (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    padding: "2rem"
                  }}>
                    <Loader size="md" />
                    <Text as="span" size="md" style={{ marginLeft: "1rem" }}>
                      Building transaction...
                    </Text>
                  </div>
                ) : xdr ? (
                  <>
                    <WalletChooser xdr={xdr} onSigned={handleSigned} />
                    <ActionButtons xdr={xdr} disabled={!connectedWallet} />
                  </>
                ) : (
                  <WalletChooser xdr="" onSigned={() => {}} />
                )}

                {/* Submission Status */}
                {isSubmitting && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    padding: "2rem"
                  }}>
                    <Loader size="md" />
                    <Text as="span" size="md" style={{ marginLeft: "1rem" }}>
                      Submitting transaction...
                    </Text>
                  </div>
                )}
              </>
            )}

            {/* Error Display */}
            {error && (
              <Alert variant="error" placement="inline">
                {error}
              </Alert>
            )}
          </div>
        </div>
        </Layout.Inset>
      </Layout.Content>
    </>
  );
};

export default Send;
