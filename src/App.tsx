import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { base } from "viem/chains";
import { config } from "./utils/wagmi";
import routes from "./utils/routes";

export const queryClient = new QueryClient();

const App = () => {
  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        loginMethods: ["email", "wallet"],
        embeddedWallets: {
          createOnLogin: "users-without-wallets",
        },
        defaultChain: base,
        appearance: {
          theme: "light",
          accentColor: "#43BDCE",
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RouterProvider router={routes} />
        </WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};

export default App;
