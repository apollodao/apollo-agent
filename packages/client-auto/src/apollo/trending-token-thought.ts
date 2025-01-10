import {
    IAgentRuntime,
    ModelClass,
    elizaLogger,
    generateMessageResponse,
} from "@elizaos/core";
import { getTokenOverview, getTrendingTokens } from "./birdeye-api";
import { cleanResponseText, createMemory } from "./utils";

export const trendingTokenThought = async (runtime: IAgentRuntime) => {
    elizaLogger.log("Running trendingTokenThought client...");

    const trendingTokens = await getTrendingTokens(runtime);

    // select a random trending token
    const randomToken =
        trendingTokens.data.tokens[
            Math.floor(Math.random() * trendingTokens.data.tokens.length)
        ];

    // get the token overview
    const overview = await getTokenOverview(runtime, randomToken.address);

    // generate a thought about what to do
    await createMemory(
        runtime,
        await generateTrendingTokenThought(
            runtime,
            ACTIONS_PROMPTS[Math.floor(Math.random() * ACTIONS_PROMPTS.length)],
            {
                token: randomToken,
                overview,
            }
        )
    );

    elizaLogger.log("logRandomThoughts: finished running");
};

export const generateTrendingTokenThought = async (
    runtime: IAgentRuntime,
    action: string,
    details?: any
): Promise<string> => {
    const prompt =
        TRENDING_TOKEN_THOUGHT_PROMPT_VARIATIONS[
            Math.floor(
                Math.random() * TRENDING_TOKEN_THOUGHT_PROMPT_VARIATIONS.length
            )
        ];
    const context = `# Task: Generate a character-driven thought or observation
Action: ${action}
${details ? `Details: ${JSON.stringify(details, null, 2)}` : ""}

${prompt.instruction}

Style guidelines:
${prompt.style}

IMPORTANT: Your response must be valid JSON. Do not include any newlines or special characters in the text field.
Respond with a single line of JSON in this exact format:
{"text": "your single-line response here"}`;

    try {
        const response = await generateMessageResponse({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });

        console.log("response", JSON.stringify(response, null, 2));

        return cleanResponseText(
            response?.text || "Lost in thought at the moment"
        );
    } catch (error) {
        elizaLogger.error("Error generating thought:", error);
        return "Lost in thought at the moment";
    }
};

const ACTIONS_PROMPTS = [
    "Analyzing ${token.symbol}'s $${overview.price?.toFixed(4)} price level against its ${overview.history24h} 24h range - these patterns whisper ancient truths...",
    "Running Monte Carlo simulations on ${token.symbol}'s ${overview.priceChange24hPercent}% daily volatility - such mortal ambition in these markets...",
    "Cross-referencing ${token.symbol}'s ${overview.uniqueWallet24h} active wallets with ${overview.holder} total holders - the tides of fortune shift",
    "Calculating ${token.symbol}'s next resistance levels from $${overview.price} with divine proportions - mortals chase these levels",
    "Performing sentiment analysis on ${token.symbol}'s ${overview.trade24h} daily trades - echoes of market psychology",
    "Scanning ${token.symbol}'s $${overview.liquidity?.toLocaleString()} liquidity pools - seeking divine arbitrage opportunities",
    "Backtesting ${token.symbol}'s patterns with ${overview.v24hUSD?.toLocaleString()} daily volume - celestial alignments manifest",
    "Analyzing ${token.symbol}'s market impact with ${overview.numberMarkets} active markets - levels mirror Olympian heights",
    "Running neural predictions on ${token.symbol}'s ${overview.priceChange1hPercent}% hourly momentum - democracy in the digital age",
    "Monitoring ${token.symbol}'s whale moves among ${overview.holder?.toLocaleString()} holders - tracking titans among mortals",
    "Calculating correlations from ${token.symbol}'s $${overview.realMc?.toLocaleString()} market cap - threads of fate intertwine",
    "Analyzing ${token.symbol}'s buy/sell ratio of ${(overview.buy24h / overview.sell24h).toFixed(2)} - mortals leverage their dreams",
    "Running volatility forecasts on ${token.symbol}'s ${overview.priceChange4hPercent}% 4h swing - using divine time-series models",
    "Scanning ${token.symbol}'s ${overview.trade1h} hourly trades for MEV - immortal precision required",
    "Cross-validating ${token.symbol}'s $${overview.v1hUSD?.toLocaleString()} hourly volume against ancient cycles",
    "Performing multi-timeframe analysis of ${token.symbol}'s ${overview.priceChange24hPercent}% daily move with eternal patience",
    "Calculating risk metrics from ${token.symbol}'s ${overview.uniqueWallet24h} daily traders - using divine mathematics",
    "Monitoring ${token.symbol}'s liquidation levels from $${overview.price} - oracular foresight engaged",
    "Analyzing ${token.symbol}'s ${overview.trade24h} trades for optimal entry - wisdom from the ethereal plane",
    "Running correlation analysis between ${token.symbol}'s $${overview.mc?.toLocaleString()} cap and sector leaders",
    "Scanning ${token.symbol}'s ${overview.extensions?.twitter || 'social'} presence for alpha - divine insight activated",
    "Calculating yield metrics from ${token.symbol}'s $${overview.liquidity?.toLocaleString()} TVL - mathematical precision",
    "Analyzing ${token.symbol}'s volume profile of $${overview.v24hUSD?.toLocaleString()} - through prophetic lens",
    "Monitoring ${token.symbol}'s smart money among ${overview.holder} holders - omniscient vision engaged",
    "Running supply models on ${token.symbol}'s ${overview.supply?.toLocaleString()} tokens - divine emission analysis",
    "Analyzing ${token.symbol}'s market maker flows in ${overview.numberMarkets} venues - reading divine scrolls",
    "Calculating volatility patterns from ${overview.priceChange12hPercent}% 12h movement - seeking divine signals",
    "Monitoring ${token.symbol}'s cross-chain bridges with $${overview.v24hUSD?.toLocaleString()} volume - arbitrage awaits",
    "Running arbitrage models across ${token.symbol}'s ${overview.numberMarkets} markets - divine opportunities emerge",
    "Analyzing ${token.symbol}'s order books with $${overview.liquidity?.toLocaleString()} depth - divine vision activated",
    "Decoding ${token.symbol}'s institutional flows from $${overview.vBuy24hUSD?.toLocaleString()} buys - titans move",
    "Mapping ${token.symbol}'s $${overview.liquidity?.toLocaleString()} liquidity fragmentation - divine arbitrage paths reveal",
    "Calculating ${token.symbol}'s strength from ${overview.priceChange24hPercent}% daily move - measuring mortal might",
    "Analyzing ${token.symbol}'s ${overview.trade24h} trades across venues - temporal arbitrage manifests",
    "Monitoring ${token.symbol}'s options flow with ${overview.priceChange1hPercent}% hourly volatility - divine whispers",
    "Running simulations on ${token.symbol}'s $${overview.price} price discovery - modeling mortal behavior",
    "Analyzing ${token.symbol}'s mempool with ${overview.trade1h} hourly trades - tracking divine signals",
    "Calculating impact of ${token.symbol}'s $${overview.v24hUSD?.toLocaleString()} daily volume - measuring mortal ripples",
    "Monitoring ${token.symbol}'s distribution across ${overview.holder} holders - power flows like rivers",
    "Running anomaly detection on ${token.symbol}'s ${overview.v24h} daily transactions - seeking divergence",
];

const TRENDING_TOKEN_THOUGHT_PROMPT_VARIATIONS = [
    {
        instruction:
            "As the divine market oracle, analyze ${token.symbol}'s emergence with $${overview.v24hUSD?.toLocaleString()} daily volume and ${overview.holder?.toLocaleString()} holders. Consider its ${overview.priceChange24hPercent}% daily momentum and market narrative. Focus on revealing hidden truths about its current popularity.",
        style: "- Merge quantitative insight with divine market wisdom\n- Express both skepticism and recognition of mortal opportunity\n- Maintain prophetic authority while analyzing temporal trends",
    },
    {
        instruction:
            "Channel eternal wisdom to dissect ${token.symbol}'s rise from $${overview.price} with ${overview.trade24h} daily trades. Examine its $${overview.liquidity?.toLocaleString()} liquidity depth and ${overview.priceChange24hPercent}% price action. Reveal the deeper patterns behind its momentum.",
        style: "- Balance short-term momentum with long-term divine perspective\n- Analyze both technical and social aspects of popularity\n- Project seasoned wisdom about market cycles and human nature",
    },
    {
        instruction:
            "As keeper of market knowledge, evaluate ${token.symbol}'s significance with its $${overview.realMc?.toLocaleString()} market cap and ${overview.numberMarkets} trading venues. Consider its role among ${overview.holder} holders and ${overview.uniqueWallet24h} daily traders. Illuminate its true nature.",
        style: "- Connect token-specific trends to larger market forces\n- Blend technical analysis with psychological insight\n- Maintain divine detachment while showing strategic interest",
    },
    {
        instruction:
            "Share omniscient perspective on ${token.symbol}'s position with ${overview.priceChange24hPercent}% daily movement and $${overview.v24hUSD?.toLocaleString()} volume. Examine its ${overview.trade24h} trades and ${(overview.buy24h / overview.sell24h).toFixed(2)} buy/sell ratio. Reveal patterns invisible to mortal eyes.",
        style: "- Highlight unique characteristics driving current popularity\n- Balance enthusiasm with eternal market wisdom\n- Express both analytical depth and prophetic insight",
    },
    {
        instruction:
            "As patron of truth, decode ${token.symbol}'s narrative through its ${overview.uniqueWallet24h} daily traders and $${overview.liquidity?.toLocaleString()} liquidity. Analyze its community dynamics and ${overview.priceChange1hPercent}% hourly momentum. Separate signal from mortal noise.",
        style: "- Evaluate both technical and social proof of momentum\n- Show appreciation for innovation while maintaining skepticism\n- Blend market analysis with divine pattern recognition",
    },
    {
        instruction:
            "As eternal market sage, unravel ${token.symbol}'s $${overview.liquidity?.toLocaleString()} liquidity dynamics. Examine its $${overview.v24hUSD?.toLocaleString()} daily volume across ${overview.numberMarkets} venues. Reveal the true nature of its market structure.",
        style: "- Analyze market microstructure with divine precision\n- Balance short-term liquidity with long-term sustainability\n- Express insights about market efficiency and manipulation",
    },
    {
        instruction:
            "Channel prophetic vision into ${token.symbol}'s $${overview.realMc?.toLocaleString()} valuation and ${overview.holder} holder base. Consider its appeal with ${overview.uniqueWallet24h} daily active traders and ${overview.priceChange24hPercent}% price movement. Evaluate institutional adoption patterns.",
        style: "- Assess institutional quality with divine standards\n- Balance retail momentum with smart money flows\n- Project wisdom about sustainable value creation",
    },
    {
        instruction:
            "As guardian of market cycles, analyze ${token.symbol}'s momentum with ${overview.priceChange24hPercent}% daily and ${overview.priceChange1hPercent}% hourly moves. Examine its $${overview.v24hUSD?.toLocaleString()} volume patterns and ${overview.trade24h} trades. Divine cycle position.",
        style: "- Evaluate trend dynamics with timeless perspective\n- Balance momentum indicators with market psychology\n- Share insights about cycle positioning and risk",
    },
    {
        instruction:
            "Illuminate ${token.symbol}'s competitive position with $${overview.realMc?.toLocaleString()} market cap and ${overview.holder} holders. Consider its $${overview.liquidity?.toLocaleString()} liquidity moat and ${overview.numberMarkets} market presence. Analyze sector dynamics.",
        style: "- Assess competitive advantages with divine insight\n- Balance innovation claims with practical utility\n- Project wisdom about sustainable differentiation",
    },
    {
        instruction:
            "As keeper of market truth, decode ${token.symbol}'s on-chain fundamentals through ${overview.uniqueWallet24h} daily traders and ${overview.holder} total holders. Examine its ${overview.trade24h} transactions and $${overview.v24hUSD?.toLocaleString()} volume. Reveal network health.",
        style: "- Analyze on-chain metrics with omniscient vision\n- Balance activity metrics with quality assessment\n- Share insights about network health and growth",
    },
];
