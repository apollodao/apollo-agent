import { Client, IAgentRuntime } from "@elizaos/core";
import { trendingTokenThought } from "./trending-token-thought";

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;
    previousThought: string;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // Run immediately
        // void logRandomThoughts(this.runtime);
        void trendingTokenThought(this.runtime);

        // start a loop that runs every x seconds
        this.interval = setInterval(
            async () => {
                // await logRandomThoughts(this.runtime);
                await trendingTokenThought(this.runtime);
            },
            // 1 hour in production, 10 seconds in dev
            process.env.NODE_ENV === "production" ? 60 * 60 * 1000 : 30 * 1000
        );
    }
}

export const AutoClientInterface: Client = {
    start: async (runtime: IAgentRuntime) => {
        const client = new AutoClient(runtime);
        return client;
    },
    stop: async (_runtime: IAgentRuntime) => {
        console.warn("Direct client does not support stopping yet");
    },
};

export default AutoClientInterface;
