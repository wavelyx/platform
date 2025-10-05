import * as Yup from "yup";

export const FormDataSchema = Yup.object().shape({
  tokenName: Yup.string().required("Token Name is required"),
  tokenSymbol: Yup.string()
    .required("Token Symbol is required")
    .max(8, "Token Symbol must be 8 characters or less"),
  description: Yup.string(),
  singleSelect: Yup.string().required("Token Program Version is required"),
  websiteLink: Yup.string().url("Website Link must be a valid URL"),
  twitter: Yup.string().url("Twitter must be a valid URL"),
  discord: Yup.string().url("Discord must be a valid URL"),
  telegram: Yup.string().url("Telegram must be a valid URL"),
  totalSupply: Yup.number()
    .positive()
    .min(1, "Total Supply must be at least 1")
    .required("Total Supply is required"),
  decimals: Yup.number()
    .min(0, "Decimals must be at least 0")
    .max(9, "Decimals can be no more than 9")
    .required("Decimals is required"),
  immutable: Yup.boolean(),
  freezeAddress: Yup.boolean(),
  mintAuthority: Yup.boolean(),
  tags: Yup.array().of(Yup.string()),
  creatorInfo: Yup.boolean(),
  creatorName: Yup.string(),
  creatorContact: Yup.string().url("Creator Website must be a valid URL"),
  coverUrl: Yup.string(),
  transactionPriority: Yup.string().required(
    "Transaction Priority is required"
  ),
});

export type Inputs = Yup.InferType<typeof FormDataSchema>;
