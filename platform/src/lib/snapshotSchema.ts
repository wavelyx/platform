import * as Yup from "yup";

export const SnapshotDataSchema = Yup.object().shape({
    // type: Yup.string().required('Asset Type Required'),
    tokenAddress: Yup.string().required('Token Address Required'),
    minBalance: Yup.number(),
    holderSince: Yup.string(),
})

export type ISnapshot = Yup.InferType<typeof SnapshotDataSchema>;