import { z } from "zod";

// Stellar public key validation (starts with G and is 56 characters)
const stellarPublicKeyRegex = /^G[A-Z2-7]{55}$/;

export const sendParamsSchema = z.object({
  to: z.string().regex(stellarPublicKeyRegex, "Invalid Stellar public key"),
  amount: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 1e14; // Max safe integer for Stellar
    },
    "Amount must be a positive number"
  ),
  memo: z.string().max(28, "Memo must be 28 characters or less").optional(),
});

export type SendParams = z.infer<typeof sendParamsSchema>;

export const validateSendParams = (params: unknown): SendParams => {
  return sendParamsSchema.parse(params);
};

// Helper to parse URL search params
export const parseUrlParams = (searchParams: URLSearchParams): SendParams => {
  const params = {
    to: searchParams.get("to") || "",
    amount: searchParams.get("amount") || "",
    memo: searchParams.get("memo") || undefined,
  };
  
  return validateSendParams(params);
};
