import React from "react";
import { Button, Icon } from "@stellar/design-system";
import { originDomain } from "../lib/env";

interface ActionButtonsProps {
  xdr: string;
  disabled?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  xdr, 
  disabled = false 
}) => {
  const handleSep7Click = () => {
    const sep7Url = `web+stellar:tx?xdr=${encodeURIComponent(xdr)}&origin_domain=${encodeURIComponent(originDomain)}`;
    window.location.href = sep7Url;
  };

  return (
    <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
      <Button
        size="md"
        variant="secondary"
        onClick={handleSep7Click}
        disabled={disabled}
        style={{ flex: 1 }}
      >
        <Icon.LinkExternal01 size="sm" />
        Open in Wallet App
      </Button>
    </div>
  );
};
