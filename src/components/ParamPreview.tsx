import React from "react";
import { Card, Text, Icon } from "@stellar/design-system";
import { SendParams } from "../lib/validation";

interface ParamPreviewProps {
  params: SendParams;
}

export const ParamPreview: React.FC<ParamPreviewProps> = ({ params }) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
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
          <Icon.Eye size="md" />
          <Text as="h3" size="lg" weight="medium">Transaction Preview</Text>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <Text as="span" size="sm" weight="medium" color="secondary">
              Recipient
            </Text>
            <Text as="p" size="md" weight="medium" title={params.to}>
              {formatAddress(params.to)}
            </Text>
          </div>
          
          <div>
            <Text as="span" size="sm" weight="medium" color="secondary">
              Amount
            </Text>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
              <Text as="span" size="xl" weight="bold" color="primary">
                {params.amount}
              </Text>
              <Text as="span" size="md" weight="medium" color="secondary">
                KALE
              </Text>
            </div>
          </div>
          
          {params.memo && (
            <div>
              <Text as="span" size="sm" weight="medium" color="secondary">
                Memo
              </Text>
              <Text as="p" size="md">
                "{params.memo}"
              </Text>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
