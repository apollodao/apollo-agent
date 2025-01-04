import { Client, IAgentRuntime, elizaLogger } from "@elizaos/core";

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // start a loop that runs every x seconds
        this.interval = setInterval(async () => {
            elizaLogger.log("running auto client...");
            elizaLogger.log("The time is: ", new Date().toISOString());

            // trigger action
            // Example of triggering an action
            const action = runtime.actions.find(
                (a) => a.name === "TOKEN_SEARCH_SYMBOL"
            );
            if (action) {
                elizaLogger.log("Checking market data...");
                await action.handler(
                    this.runtime,
                    {
                        content: {
                            text: "I want to you search for the token info of $ai16z",
                        },
                        userId: "12dea96f-ec20-0935-a6ab-75692c994959",
                        roomId: "0212b84f-9c29-0adf-bd65-e87cc58bdd36",
                        agentId: "633a74f5-d793-000c-ae28-02a1bf2f0da8",
                    },
                    null,
                    null,
                    (result) => {
                        elizaLogger.log("Result: ", result);
                        return Promise.resolve([]);
                    }
                );
            }
        }, 10 * 1000); // 1 minute
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
