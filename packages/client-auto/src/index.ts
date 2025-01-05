import { Client, IAgentRuntime, elizaLogger } from "@elizaos/core";
import { APOLLO_WALLET_ADDRESS } from "./constants";
import {
    createMemory,
    getMetadata,
    getTokenOverview,
    getTokenSecurity,
    getTokenTradeData,
    getWalletPortfolio,
} from "./get-wallet-portfolio";
import { generateThought } from "./utils";

export class AutoClient {
    interval: NodeJS.Timeout;
    runtime: IAgentRuntime;

    constructor(runtime: IAgentRuntime) {
        this.runtime = runtime;

        // start a loop that runs every x seconds
        // this.interval = setInterval(
        //     async () => {
        //         this.updateAllPositionsAndStrategies();
        //     },
        //     5 * 60 * 1000
        // ); // 5 minutes

        // this.updateAllPositionsAndStrategies();
    }

    private updateAllPositionsAndStrategies = async () => {
        elizaLogger.log("Running updateAllPositionsAndStrategies client...");
        elizaLogger.log("The time is: ", new Date().toISOString());

        // generate a thought about what to do
        await createMemory(
            this.runtime,
            await generateThought(
                this.runtime,
                "I need to update all positions and strategies for my portfolio. I need to get the current positions, check and evaluate market data for each token currently held to consider buy/sell, check trending tokens, check influencer tweets & sentiment, check news, check banter bubbles, check google trends, check reddit trends, check twitter trends, get technical analysis data for each token",
                {
                    walletAddress: APOLLO_WALLET_ADDRESS,
                }
            )
        );

        // get the current portfolio for the input wallet
        const portfolio = await getWalletPortfolio(
            this.runtime,
            APOLLO_WALLET_ADDRESS
        );

        // for each token in the portfolio, do a little dance
        for (let i = 0; i < portfolio.data.items.length; i++) {
            const item = portfolio.data.items[i];

            // generate a thought about this token
            await createMemory(
                this.runtime,
                await generateThought(
                    this.runtime,
                    `Ok, i need to look at the token: ${item.symbol} - ${item.name} in my portfolio. This is my ${i + 1}th largest holding in this wallet. I need to look at the market data for this token, check trending tokens, check influencer tweets & sentiment, check news, check banter bubbles, check google trends, check reddit trends, check twitter trends, get technical analysis data for this token`,
                    {
                        token: item,
                    }
                )
            );

            // get the token overview and generate a thought about it
            const overview = await getTokenOverview(this.runtime, item.address);
            await createMemory(
                this.runtime,
                await generateThought(
                    this.runtime,
                    `Ok, I need to analyze the data in this token overview and determine if this token is a good buy, sell, or hold.`,
                    {
                        overview,
                    }
                )
            );

            // get the token metadata and generate a thought about it
            const metadata = await getMetadata(this.runtime, item.address);
            await createMemory(
                this.runtime,
                await generateThought(
                    this.runtime,
                    `Read and understand the metadata associated with this token to determine if this token is a good buy, sell, or hold.`,
                    {
                        metadata,
                    }
                )
            );

            // get the security data for this token
            const security = await getTokenSecurity(this.runtime, item.address);
            await createMemory(
                this.runtime,
                await generateThought(
                    this.runtime,
                    `Read and understand the security data associated with this token to determine if this token is a good buy, sell, or hold.`,
                    {
                        security,
                    }
                )
            );

            // get the trade data for this token
            const tradeData = await getTokenTradeData(
                this.runtime,
                item.address
            );
            await createMemory(
                this.runtime,
                await generateThought(
                    this.runtime,
                    `Read and understand the trade data associated with this token to determine if this token is a good buy, sell, or hold.`,
                    {
                        tradeData,
                    }
                )
            );

            // summarize the recent memories related to this token and determine if its time to buy, sell, or hold

            // TODO - get the influencer tweets & sentiment for this token

            // TODO - get the news for this token

            // TODO - get the banter bubbles for this token

            // TODO - get the google trends for this token

            // TODO - get the reddit trends for this token

            // TODO - get the twitter trends for this token
        }

        elizaLogger.log("updateAllPositionsAndStrategies: finished running");
    };
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
