import { Plugin } from "@elizaos/core";
import { tokenSearchAddressAction } from "./actions/token-search-address";
import { tokenSearchSymbolAction } from "./actions/token-search-symbol";
import { walletSearchAddressAction } from "./actions/wallet-search-address";
import { BirdeyeProvider } from "./birdeye";
import { agentPortfolioProvider } from "./providers/agent-portfolio-provider";

// Re-export all types
export * from "./types";

// export the BirdeyeProvider class to use in client-auto
export { BirdeyeProvider };

export const birdeyePlugin: Plugin = {
    name: "birdeye",
    description: "Birdeye Plugin for token data and analytics",
    actions: [
        tokenSearchSymbolAction,
        tokenSearchAddressAction,
        walletSearchAddressAction,
    ],
    evaluators: [],
    providers: [agentPortfolioProvider],
};

export default birdeyePlugin;
