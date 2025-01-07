import { useEffect, useRef } from "react";
import { createOkxSwapWidget } from "@okxweb3/dex-widget";

const params = {
  chainIds: [], // [1, 501] , 1 (Mainnet), 56 (BSC), 501 (Solana)
  theme: "dark", // light/dark or provide your own color palette
  tradeType: "auto", // The type of transaction. It can be “swap”, “bridge”, or “auto”.
  providerType: "EVM", // ProviderType represents the type of the provider and corresponds to it one-to-one. For example, if the provider is Solana, then the providerType would be SOLANA.
  lang: "unknown",
  provider: "",
  baseUrl: "https://www.okx.com",
  width: "", // Width in pixels (or 100% to use all available space)
};
// Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com
const provider = window.ethereum;

export const OkSwapWidgetDemo = () => {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const initialConfig = {
    params,
    provider,
    listeners: [
      {
        event: "ON_CONNECT_WALLET",
        handler: () => {
          provider.enable();
        },
      },
    ],
  };

  useEffect(() => {
    if (!widgetRef.current) return;
    const widgetHandler = createOkxSwapWidget(
      widgetRef.current,
      initialConfig as any
    );

    return () => {
      widgetHandler?.destroy();
    };
  }, []);

  return <div ref={widgetRef} />;
};
