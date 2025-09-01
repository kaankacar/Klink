import React from "react";
import { Card, Text, Icon, Button, Alert } from "@stellar/design-system";
import { SubmissionResult } from "../lib/submit";

interface TransactionResultProps {
  result: SubmissionResult;
  onReset: () => void;
}

export const TransactionResult: React.FC<TransactionResultProps> = ({ 
  result, 
  onReset 
}) => {
  const handleExplorerClick = () => {
    if (result.explorerUrl) {
      window.open(result.explorerUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card>
      <div style={{ padding: "1.5rem" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "0.5rem",
          marginBottom: "1rem"
        }}>
          {result.success ? (
            <Icon.CheckCircle size="md" color="success" />
          ) : (
            <Icon.XCircle size="md" color="error" />
          )}
          <Text as="h3" size="lg" weight="medium">
            {result.success ? "Transaction Successful!" : "Transaction Failed"}
          </Text>
        </div>
        
        {result.success ? (
          <Alert variant="success" placement="inline">
            Your KALE transfer has been completed successfully!
          </Alert>
        ) : (
          <Alert variant="error" placement="inline">
            {result.error || "Transaction failed for unknown reason"}
          </Alert>
        )}
        
        {result.hash && (
          <div style={{ marginBottom: "1.5rem" }}>
            <Text as="span" size="sm" weight="medium" color="secondary">
              Transaction Hash
            </Text>
            <Text as="p" size="sm" style={{ fontFamily: "monospace", wordBreak: "break-all" }}>
              {result.hash}
            </Text>
          </div>
        )}
        
        <div style={{ display: "flex", gap: "0.75rem" }}>
          {result.explorerUrl && (
            <Button
              size="md"
              variant="primary"
              onClick={handleExplorerClick}
              style={{ flex: 1 }}
            >
              <Icon.LinkExternal01 size="sm" />
              View on Stellar Expert
            </Button>
          )}
          
          <Button
            size="md"
            variant="secondary"
            onClick={onReset}
            style={{ flex: result.explorerUrl ? 0 : 1 }}
          >
            <Icon.ArrowLeft size="sm" />
            Send Another
          </Button>
        </div>
      </div>
    </Card>
  );
};
