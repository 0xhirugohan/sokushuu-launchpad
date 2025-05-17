import { Context } from 'hono'

type Bindings = {
    GEMINI_PRIVATE_KEY: string;
}

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

const generateImage = async (c: Context<{ Bindings: Bindings }>) => {
    const body = await c.req.json();
    if (!body.prompt) {
        c.status(400)
        return c.json({ ok: false, message: 'Prompt should not be empty' });
    }

    const prompt = body.prompt;

    try {
        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: "You are an expert in traditional art and digital drawing. You can make an image from anything. Your task is making an image that follow strongly to description that sent by user. You can only response by image, not text. Do not attach any text in the image." },
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                responseModalities: ["TEXT", "IMAGE"]
            }
        };

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${c.env.GEMINI_PRIVATE_KEY}`,
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

        const geminiResponse: GeminiResponse = await response.json() as GeminiResponse;
        const promptResponses: string[] = [];
        const promptImageResponses: { mimeType: string; data: string }[] = [];
        for (const candidate of geminiResponse.candidates) {
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

        const generated = promptImageResponses.length > 0 ? promptImageResponses : promptResponses;
        const generatedType = promptImageResponses.length > 0 ? 'IMAGE' : 'TEXT';

        return c.json({
            ok: true,
            message: "Image generated successfully!",
            generated: generated,
            generatedType: generatedType,
            text: prompt,
        });
    } catch (err) {
        console.log({ err });
        c.status(500);
        return c.json({
            ok: false,
            message: "Something is wrong with the server. Please try again later or report to us."
        })
    }
}

export default generateImage;