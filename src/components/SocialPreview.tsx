import React from "react";
import { Helmet } from "react-helmet-async";
import { SendParams } from "../lib/validation";

interface AirdropData {
  amount: string;
  memo?: string;
  from?: string;
}

interface SocialPreviewProps {
  params?: SendParams;
  airdropData?: AirdropData;
  isHomePage?: boolean;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({ 
  params, 
  airdropData,
  isHomePage = false 
}) => {
  const baseTitle = "🥬 KALE Links - Stellar Token Airdrops";
  const baseDescription = "Create airdrop links for people to claim KALE tokens from your wallet on Stellar Testnet";
  const baseImage = `${window.location.origin}/favicon.ico`; // Use favicon for now
  
  if (isHomePage) {
    return (
      <Helmet>
        <title>{baseTitle}</title>
        <meta name="description" content={baseDescription} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={baseTitle} />
        <meta property="og:description" content={baseDescription} />
        <meta property="og:image" content={baseImage} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={baseTitle} />
        <meta name="twitter:description" content={baseDescription} />
        <meta name="twitter:image" content={baseImage} />
        
        {/* Additional Meta */}
        <meta name="theme-color" content="#6366f1" />
      </Helmet>
    );
  }

  if (airdropData) {
    const title = `🎁 Free ${airdropData.amount} KALE Airdrop!`;
    const description = `Click to claim ${airdropData.amount} KALE tokens for free! ${airdropData.memo ? `"${airdropData.memo}"` : 'Connect your Stellar wallet to claim.'}`;
    
    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={baseImage} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={baseImage} />
        
        {/* Airdrop specific */}
        <meta property="og:site_name" content="KALE Links" />
        <meta name="twitter:site" content="@StellarOrg" />
        
        {/* Additional Meta */}
        <meta name="theme-color" content="#f59e0b" />
      </Helmet>
    );
  }

  if (params) {
    const title = `💸 Send ${params.amount} KALE${params.memo ? ` - "${params.memo}"` : ''}`;
    const description = `Click to send ${params.amount} KALE tokens to ${params.to.slice(0, 8)}...${params.to.slice(-8)} on Stellar Testnet`;
    
    return (
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={baseImage} />
        <meta property="og:url" content={window.location.href} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={baseImage} />
        
        {/* Payment specific */}
        <meta property="og:site_name" content="KALE Links" />
        <meta name="twitter:site" content="@StellarOrg" />
        
        {/* Additional Meta */}
        <meta name="theme-color" content="#10b981" />
      </Helmet>
    );
  }

  return null;
};
