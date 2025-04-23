interface GeminiResponseCandidateDataPartInlineData {
  mimeType: string;
  data: string;
}

interface GeminiResponseCandidateDataPart {
  inlineData: GeminiResponseCandidateDataPartInlineData;
  text: string;
}

interface GeminiResponseCandidateData {
  parts: GeminiResponseCandidateDataPart[];
  role: string;
}

interface GeminiResponseCandidate {
  content: GeminiResponseCandidateData;
  finishReason: string;
  index: number;
}

interface GeminiResponseTokenDetail {
  modality: string;
  tokenCount: number;
}

interface GeminiResponse {
  candidates: GeminiResponseCandidate[];
  usageMetadata: {
    promptTokenCount: number;
    totalTokenCount: number;
    promptTokensDetails: GeminiResponseTokenDetail[];
  };
  modelVersion: string;
}

interface GenerateImageArgs {
    prompt: string;
    geminiApiKey: string;
}

const generateImage = async ({ prompt, geminiApiKey }: GenerateImageArgs) => {
    try {
        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw `API Error: ${response.status} ${errorText}`;
        }

        const { candidates }: GeminiResponse = await response.json();
        const promptResponses: string[] = [];
        const promptImageResponses: { mimeType: string; data: string }[] = [];
        for (const candidate of candidates) {
            for (const part of candidate.content.parts) {
                const isImage = part?.text === undefined || part?.text === "";
                if (isImage) {
                    promptImageResponses.push({
                        mimeType: part.inlineData.mimeType,
                        data: part.inlineData.data,
                    });
                } else {
                    promptResponses.push(part.text);
                }
            }
        }

        return {
            generated: promptImageResponses.length > 0 ? promptImageResponses : promptResponses,
            generatedType: promptImageResponses.length > 0 ? 'IMAGE' : 'TEXT',
        };
    } catch (err) {
        throw err;
    }  
}

export { generateImage };