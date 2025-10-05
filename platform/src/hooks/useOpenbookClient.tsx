// import { OpenBookV2Client } from "@openbook-dex/openbook-v2";
// import { Connection, Keypair } from "@solana/web3.js";
// import { AnchorProvider } from "@coral-xyz/anchor";
// import EmptyWallet from "./emptyWallet";
// import { useProvider } from "./useProvider";


// // MAINNET
// // export const RPC = "https://misty-wcb8ol-fast-mainnet.helius-rpc.com/";
// // DEVNET
// const RPC = "https://aimil-f4d13p-fast-devnet.helius-rpc.com/";


// export function useOpenbookClient(): OpenBookV2Client {
//   const provider = useProvider();

//   let client = new OpenBookV2Client(provider);
//   return client;
// }


// export function useHookConnection(): Connection {
//   const connection = new Connection(RPC);
//   return connection;
// }

// export function useFakeProvider(): AnchorProvider {
//   return new AnchorProvider(
//     useHookConnection(),
//     new EmptyWallet(Keypair.generate()),
//     {
//       /** disable transaction verification step */
//       skipPreflight: true,
//       /** desired commitment level */
//       commitment: "confirmed",
//       /** preflight commitment level */
//       preflightCommitment: "confirmed",
//       /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
//       maxRetries: 3,
//       /** The minimum slot that the request can be evaluated at */
//       minContextSlot: 10,
//     }
//   );
// }
