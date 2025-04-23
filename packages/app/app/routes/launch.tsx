import { type State } from "wagmi";
import type { Address } from "viem";

import type { Route } from "./+types/launch";
import { getWalletStateFromCookie } from "~/libs/cookie";
import { generateImage } from "~/libs/gemini";
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
    nftContracts,
    managerContractAddress: context.cloudflare.env.MANAGER_CONTRACT_ADDRESS,
  };
}

export async function action({ context, request }: Route.ActionArgs) {
  const geminiApiKey = context.cloudflare.env.GEMINI_API_KEY;
  const formData = await request.formData();
  const text = formData.get("text") as string;

  try {
    const { generated, generatedType } = await generateImage({
      prompt: text,
      geminiApiKey,
    });

    return {
        ok: true,
        message: "Image generated successfully!",
        generated,
        generatedType,
        text,
    };
  } catch (error) {
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
        managerContractAddress={loaderData.managerContractAddress as Address}
    />
}