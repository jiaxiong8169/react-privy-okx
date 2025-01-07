import { useRef, useEffect, useState, useMemo } from "react";
import {
  createOkxSwapWidget,
  ProviderType,
  TradeType,
  OkxEventListeners,
  OkxEvents,
  fetchDomain,
  OkxSwapWidgetHandler,
} from "@okxweb3/dex-widget";
import {
  ConnectedWallet,
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
  const [domain, setDomain] = useState<string | undefined>("fetching");
  const { wallets } = useWallets();
  const { user, login } = usePrivy();
  const [provider, setProvider] = useState<any | undefined>();
  const { connectWallet } = useConnectWallet();
  const { setActiveWallet } = useSetActiveWallet();
  const [instance, setInstance] = useState<OkxSwapWidgetHandler | undefined>();
  const [targetWallet, setTargetWallet] = useState<
    ConnectedWallet | undefined
  >();

  const listeners: OkxEventListeners = useMemo(() => {
    return [
      {
        event: OkxEvents.ON_CONNECT_WALLET,
        // useCallback, updateListeners
        handler: async () => {
          console.log(
            "createOkxSwapWidgetWithPrivy - OkxEvents.ON_CONNECT_WALLET",
            "privy.provider",
            provider,
            "privy.user",
            user
          );
          if (!user?.id) {
            login();
            return;
          }
          connectWallet({
            suggestedAddress: user?.wallet?.address ?? "",
          });
        },
      },
    ];
  }, [user?.id, user?.wallet?.address, login, connectWallet]);

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
    if (!widgetRef.current || domain === "fetching") return;
    console.log(
      "createOkxSwapWidgetWithPrivy - instantiation",
      "tokenPair",
      tokenPair,
      "domain",
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
    setInstance(localInstance);
    return () => {
      localInstance?.destroy();
    };
  }, [tokenPair, domain]);

  const refetchProvider = async () => {
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
      "createOkxSwapWidgetWithPrivy - privy refetchProvider",
      "privy.provider",
      privyProvider,
      "privy.user.wallet.address",
      user?.wallet?.address,
      "privy.wallets",
      wallets,
      "privy.targetWallet",
      targetWallet
    );
    // @ts-ignore
    setProvider(privyProvider?.walletProvider ?? privyProvider);
    setTargetWallet(targetWallet);
  };

  useEffect(() => {
    refetchProvider();
  }, [wallets, user?.wallet?.address]);

  useEffect(() => {
    console.log(
      "privyProvider has changed",
      "privy.provider",
      provider,
      "okswap.instance",
      instance,
      "privy.targetWallet",
      targetWallet
    );
    instance?.updateProvider(
      provider,
      targetWallet?.connectorType?.includes("wallet_connect")
        ? ProviderType.WALLET_CONNECT
        : ProviderType.EVM
    );
  }, [provider, targetWallet]);

  useEffect(() => {
    instance?.updateListeners(listeners);
  }, [listeners]);

  // set domain on load
  useEffect(() => {
    fetchDomain()
      .then((domain) => {
        setDomain(domain ?? undefined);
      })
      .catch(() => {
        setDomain(undefined);
      });
  }, []);

  return <div ref={widgetRef} className="w-full rounded-2xl overflow-hidden" />;
};
