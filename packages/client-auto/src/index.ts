import { Client, IAgentRuntime } from "@elizaos/core";
import { logRandomThoughts } from "./random-thoughts";

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;
    previousThought: string;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // Run immediately
        void logRandomThoughts(this.runtime);

        // start a loop that runs every x seconds
        this.interval = setInterval(
            async () => {
                await logRandomThoughts(this.runtime);
            },
            1 * 30 * 1000
        ); // 30 seconds
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
