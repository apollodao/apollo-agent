import { Plugin } from "@elizaos/core";
import { trendingTokensProvider } from "./providers/trending-tokens";
export const birdeyePlugin: Plugin = {
    name: "birdeye",
    description: "Birdeye Plugin for token data and analytics",
    actions: [],
    evaluators: [],
    providers: [trendingTokensProvider],
};

export default birdeyePlugin;
