import { useRef, useEffect, useState, useMemo } from "react";
import {
  createOkxSwapWidget,
  ProviderType,
  TradeType,
  OkxEventListeners,
  OkxEvents,
  fetchDomain,
} from "@okxweb3/dex-widget";
import {
  EIP1193Provider,
  useConnectWallet,
  usePrivy,
  useWallets,
} from "@privy-io/react-auth";
import { useSetActiveWallet } from "@privy-io/wagmi";
import { base } from "viem/chains";

type Props = {
  tokenAddress: string;
};

export const OkSwapWidgetWithPrivyProvider: React.FC<Props> = ({
  tokenAddress,
}) => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const [domain, setDomain] = useState<string | undefined>();
  const { wallets } = useWallets();
  const { user, login } = usePrivy();
  const [provider, setProvider] = useState<any | undefined>();
  const { connectWallet } = useConnectWallet();
  const { setActiveWallet } = useSetActiveWallet();

  const listeners: OkxEventListeners = useMemo(() => {
    return [
      {
        event: OkxEvents.ON_CONNECT_WALLET,
        handler: async () => {
          console.log(
            "createOkxSwapWidgetWithPrivy - OkxEvents.ON_CONNECT_WALLET",
            provider,
            user
          );
          if (!user?.id) {
            login();
            return;
          }
          if (!!provider) {
            provider.enable();
          } else
            connectWallet({
              suggestedAddress: user?.wallet?.address ?? "",
            });
        },
      },
    ];
  }, [user, provider]);

  // set domain on load
  useEffect(() => {
    fetchDomain()
      .then((domain) => {
        setDomain(domain ?? undefined);
      })
      .catch(() => {});
  }, []);

  // populate token pair
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
    console.log(
      "createOkxSwapWidgetWithPrivy",
      window.ethereum,
      provider,
      tokenPair,
      domain
    );

    const localInstance = createOkxSwapWidget(widgetRef.current, {
      params: {
        width: widgetRef.current?.clientWidth ?? 375,
        providerType: ProviderType.EVM,
        chainIds: ["8453"],
        tradeType: TradeType.SWAP,
        tokenPair: tokenPair,
        baseUrl: domain ? domain : undefined,
      },
      provider: provider,
      listeners,
    });

    return () => {
      localInstance?.destroy();
    };
  }, [tokenPair, domain, provider, listeners]);

  const refetchProvider = async () => {
    // Choose the provider used by the privy user
    const targetWallet = wallets?.find(
      (wallet) =>
        wallet.address?.toLowerCase() === user?.wallet?.address?.toLowerCase()
    );
    let privyProvider: EIP1193Provider | undefined;
    if (!!targetWallet) {
      await setActiveWallet(targetWallet);
      privyProvider = await targetWallet.getEthereumProvider();
    }
    console.log(
      "createOkxSwapWidgetWithPrivy - refetchProvider",
      targetWallet,
      privyProvider
    );
    // @ts-ignore
    setProvider(privyProvider?.walletProvider);
  };

  useEffect(() => {
    refetchProvider();
  }, [wallets, user?.wallet?.address]);

  return <div ref={widgetRef} className="w-full rounded-2xl overflow-hidden" />;
};
