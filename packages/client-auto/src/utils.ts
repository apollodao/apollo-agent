import {
    elizaLogger,
    generateMessageResponse,
    IAgentRuntime,
    ModelClass,
} from "@elizaos/core";

export const generateAnalysis = async (
    runtime: IAgentRuntime,
    item: any
): Promise<string> => {
    const context = `# Task: Generate a brief technical analysis for a token
Token Data: ${JSON.stringify(item, null, 2)}

Generate a brief, semi-random but plausible technical analysis of this token. Include:
- Price action observations
- Volume analysis
- Technical indicators (if relevant)
- A speculative outlook

Keep it concise but make it sound natural and slightly different each time.

Response should be in JSON format:
{
"text": "your analysis here"
}`;

    try {
        const response = await generateMessageResponse({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });
        return response?.text || "Unable to generate analysis at this time";
    } catch (error) {
        elizaLogger.error("Error generating analysis:", error);
        return "Unable to generate analysis at this time";
    }
};

export const generateThought = async (
    runtime: IAgentRuntime,
    action: string,
    details?: any
): Promise<string> => {
    const context = `# Task: Generate a character-driven thought or observation
Action: ${action}
${details ? `Details: ${JSON.stringify(details, null, 2)}` : ""}

Generate a brief, natural-sounding thought or observation about this action. The response should:
- Sound like a trader/analyst thinking out loud
- Include relevant technical or market-specific terminology when appropriate
- Have a confident but thoughtful tone
- Vary in style and wording each time
- Be concise but insightful

Response should be in JSON format:
{
"text": "your thought here"
}`;

    try {
        const response = await generateMessageResponse({
            runtime,
            context,
            modelClass: ModelClass.SMALL,
        });
        return response?.text || "Hmm, lost in thought at the moment";
    } catch (error) {
        elizaLogger.error("Error generating thought:", error);
        return "Hmm, lost in thought at the moment";
    }
};
