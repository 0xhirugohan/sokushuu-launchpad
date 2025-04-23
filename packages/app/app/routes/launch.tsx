import { type State } from "wagmi";
import type { Address } from "viem";

import type { Route } from "./+types/launch";
import { getWalletStateFromCookie } from "~/libs/cookie";
import { LaunchPage } from "~/pages/launch";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sokushuu Launchpad - Launch" },
    { name: "description", content: "It's time to launch your customized NFT" },
  ];
}

export async function loader({ context, request }: Route.LoaderArgs) {
  const initialState = await getWalletStateFromCookie({ request });
  const nftContracts: Address[] = []; 
  return {
    initialState,
    nftContracts
  };
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

export async function action({ context, request }: Route.ActionArgs) {
  const formData = await request.formData();
  const text = formData.get("text");

  const geminiApiKey = context.cloudflare.env.GEMINI_API_KEY;

  const requestBody = {
    contents: [{ parts: [{ text: text }] }],
    generationConfig: {
      responseModalities: ["TEXT", "IMAGE"]
    }
  };

  try {
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
        console.error("Gemini API request failed:", response.status, errorText);
        return { ok: false, error: `API Error: ${response.status} ${errorText}` };
    }

    const { candidates, usageMetadata, modelVersion }: GeminiResponse = await response.json();
    const { promptTokensDetails } = usageMetadata;
    console.log({ candidates, usageMetadata, modelVersion, promptTokensDetails });
    const promptResponses: string[] = [];
    const promptImageResponses: { mimeType: string; data: string }[] = [];
    candidates.forEach((candidate) => {
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
    })

    return {
        ok: true,
        message: "Image generated successfully!",
        generated: promptImageResponses.length > 0 ? promptImageResponses : promptResponses,
        generatedType: promptImageResponses.length > 0 ? 'IMAGE' : 'TEXT',
        text,
    };
  } catch (error) {
    console.log({ error });
    return {
      ok: false,
      error: "An unexpected error occurred."
    };
  }
}

export default function Launch({ loaderData }: Route.ComponentProps) {
    return <LaunchPage
        initialState={loaderData.initialState as State | undefined}
        nftContracts={loaderData.nftContracts}
    />
}