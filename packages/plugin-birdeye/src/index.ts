import { Plugin } from "@elizaos/core";
import { getTrendingTokensAction } from "./actions/getTrendingTokens";
import { birdeyeProvider } from "./providers/birdeye";

export const birdeyePlugin: Plugin = {
    name: "birdeye",
    description: "Birdeye Plugin for token data and analytics",
    actions: [getTrendingTokensAction],
    evaluators: [],
    providers: [birdeyeProvider],
};

export default birdeyePlugin;
