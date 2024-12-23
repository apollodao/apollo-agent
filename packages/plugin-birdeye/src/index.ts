import { Plugin } from "@elizaos/core";
import { tokenListProvider } from "./providers/token-list";
import { tokenOverviewProvider } from "./providers/token-overview";
import { trendingTokensProvider } from "./providers/trending-tokens";

export const birdeyePlugin: Plugin = {
    name: "birdeye",
    description: "Birdeye Plugin for token data and analytics",
    actions: [],
    evaluators: [],
    providers: [
        trendingTokensProvider,
        tokenListProvider,
        tokenOverviewProvider,
    ],
};

export default birdeyePlugin;
