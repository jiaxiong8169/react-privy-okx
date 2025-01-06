import { useRef, useEffect, useState, useMemo } from "react";
import {
  createOkxSwapWidget,
  ProviderType,
  TradeType,
  OkxEventListeners,
  OkxEvents,
  fetchDomain,
} from "@okxweb3/dex-widget";
import { base } from "viem/chains";

type Props = {
  tokenAddress: string;
};

const provider = window.ethereum;

export const OkSwapWidget: React.FC<Props> = ({ tokenAddress }) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState<string | undefined>();

  const listeners: OkxEventListeners = [
    {
      event: OkxEvents.ON_CONNECT_WALLET,
      handler: async () => {
        provider?.enable();
      },
    },
  ];
  useEffect(() => {
    fetchDomain()
      .then((domain) => {
        setDomain(domain ?? undefined);
      })
      .catch(() => {});
  }, []);

  const tokenPair = useMemo(() => {
    if (!tokenAddress) return;
    return {
      fromChain: base.id,
      toChain: base.id,
      fromToken: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
      toToken: tokenAddress,
    };
  }, [tokenAddress]);

  useEffect(() => {
    if (!widgetRef.current) return;
    console.log("createOkxSwapWidget", provider, tokenPair, domain);

    const localInstance = createOkxSwapWidget(widgetRef.current, {
      params: {
        width: widgetRef.current?.clientWidth ?? 375,
        providerType: ProviderType.EVM,
        chainIds: ["8453"],
        tradeType: TradeType.SWAP,
        tokenPair: tokenPair,
        baseUrl: domain ? domain : undefined,
      },
      provider,
      listeners,
    });

    return () => {
      localInstance?.destroy();
    };
  }, [provider, tokenPair, domain]);

  return <div ref={widgetRef} className="w-full rounded-2xl overflow-hidden" />;
};
