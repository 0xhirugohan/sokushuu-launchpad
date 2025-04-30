import { type State } from "wagmi";
import type { Address } from "viem";
import { AwsClient } from "aws4fetch";
import { redirect } from "react-router";

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
  const txHash = formData.get("hash") as string;

  console.log({ txHash });

  try {
    if (txHash && txHash !== "") {
      const image = formData.get("image") as string;
      const imageMimetype = formData.get("image_mimetype") as string;
      const imageData = formData.get("image_data");
      const nftContractAddress = formData.get("nft_contract_address");
      const nftTokenId = formData.get("nft_token_id");

      if (!nftTokenId) {
        return {
          ok: false,
          error: "Token ID should not be empty or Token ID not found",
        }
      }

      const client = new AwsClient({
        service: "s3",
        region: "auto",
        accessKeyId: context.cloudflare.env.R2_ACCESS_KEY,
        secretAccessKey: context.cloudflare.env.R2_SECRET_KEY,
      });

      const key = `${nftContractAddress?.toString().toLocaleLowerCase()}/${nftTokenId}.png`;
      const signedUrl = await client.sign(
        new Request(`${context.cloudflare.env.R2_ENDPOINT}/sokushuu-launchpad-dev-r2/images/${key}?X-Amz-Expires=${3600}`, {
          method: 'PUT',
        }),
        {
          aws: {
            signQuery: true,
            service: "s3",
            accessKeyId: context.cloudflare.env.R2_ACCESS_KEY,
            secretAccessKey: context.cloudflare.env.R2_SECRET_KEY,
          },
        },
      )

      const signedUrlString = signedUrl.url.toString();
      const imageBuffer = Buffer.from(image, "base64");
      await fetch(signedUrlString, {
        method: 'PUT',
        headers: {
          'Content-Type': imageMimetype ?? 'multipart/form-data',
        },
        body: imageBuffer,
      });

      return redirect(`/view/${nftContractAddress}/${nftTokenId}`);
    } else {
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
    }
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
        managerContractAddress={loaderData.managerContractAddress as Address}
    />
}