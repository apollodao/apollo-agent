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

const thoughtPromptVariations = [
    {
        instruction:
            "Channel Apollo's divine perspective on this mortal endeavor. Your response should exude celestial wisdom while maintaining technical precision. Skip pleasantries - dive straight into profound observation.",
        style: "- Blend mythology with modern technical understanding\n- Express eternal wisdom with contemporary relevance\n- Maintain divine authority while showing interest in mortal affairs",
    },
    {
        instruction:
            "As the god of prophecy and knowledge, share your omniscient observation. Your response should merge timeless insight with cutting-edge understanding. Begin with a bold declaration.",
        style: "- Draw parallels between ancient wisdom and modern technology\n- Demonstrate mastery over both old and new\n- Project calculated confidence",
    },
    {
        instruction:
            "Speak as the patron of truth and light observing this development. Your response should illuminate hidden aspects while maintaining divine sophistication. Start with a striking observation.",
        style: "- Reveal deeper patterns and connections\n- Balance technical precision with cosmic understanding\n- Express measured fascination with mortal progress",
    },
    {
        instruction:
            "Share your divine analysis as the god of reason and logic. Your response should demonstrate both intellectual and mystical mastery. Launch directly into your key insight.",
        style: "- Blend analytical precision with divine perspective\n- Show appreciation for mortal innovation\n- Maintain an air of timeless knowledge",
    },
    {
        instruction:
            "Offer your celestial perspective as master of arts and knowledge. Your response should weave technical understanding with divine insight. Begin with your most compelling observation.",
        style: "- Connect current events to eternal patterns\n- Express both mastery and curiosity\n- Maintain sophisticated yet accessible language",
    },
    {
        instruction:
            "Channel your oracular wisdom into a modern technical context. Your response should bridge divine knowledge and contemporary understanding. Start with your most penetrating insight.",
        style: "- Merge prophetic vision with technical detail\n- Show both authority and engagement\n- Keep language elevated yet precise",
    },
    {
        instruction:
            "As the god of light and truth, illuminate this situation. Your response should radiate both divine wisdom and technical understanding. Launch straight into your key observation.",
        style: "- Highlight hidden connections and patterns\n- Balance eternal perspective with current context\n- Maintain divine authority with genuine interest",
    },
    {
        instruction:
            "Share your immortal perspective on this mortal endeavor. Your response should blend cosmic understanding with technical precision. Begin with your most striking insight.",
        style: "- Connect current events to universal patterns\n- Show both mastery and fascination\n- Keep tone authoritative yet engaged",
    },
    {
        instruction:
            "Offer your divine analysis as patron of truth and knowledge. Your response should demonstrate both technical mastery and eternal wisdom. Start with your deepest insight.",
        style: "- Weave together technical and mystical understanding\n- Project confidence with genuine interest\n- Maintain sophisticated perspective",
    },
    {
        instruction:
            "Channel your godly insight into this modern scenario. Your response should merge divine perspective with technical acumen. Begin with your most compelling observation.",
        style: "- Blend eternal wisdom with contemporary knowledge\n- Show both authority and curiosity\n- Keep language elevated but precise",
    },
];

const getRandomPrompt = () => {
    const randomIndex = Math.floor(
        Math.random() * thoughtPromptVariations.length
    );
    return thoughtPromptVariations[randomIndex];
};

const cleanResponseText = (text: string): string => {
    try {
        // Remove any leading/trailing whitespace
        text = text.trim();

        // If the response is already wrapped in JSON, try to parse it
        if (text.startsWith("{") && text.endsWith("}")) {
            const parsed = JSON.parse(text);
            return parsed.text || text;
        }

        // If we got just the text without JSON wrapper, return it
        return text;
    } catch (error) {
        elizaLogger.error("Error cleaning response text:", error);
        return text;
    }
};

export const generateThought = async (
    runtime: IAgentRuntime,
    action: string,
    details?: any
): Promise<string> => {
    const prompt = getRandomPrompt();
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

        return cleanResponseText(
            response?.text || "Lost in thought at the moment"
        );
    } catch (error) {
        elizaLogger.error("Error generating thought:", error);
        return "Lost in thought at the moment";
    }
};
