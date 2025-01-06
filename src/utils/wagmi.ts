import { createConfig } from "@privy-io/wagmi";
import { http } from "wagmi";
import { base, baseSepolia, mainnet, sepolia } from "wagmi/chains";

declare module "wagmi" {
  interface Register {
    config: typeof config;
  }
}

export const config = createConfig({
  chains: [base, baseSepolia, mainnet, sepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});
