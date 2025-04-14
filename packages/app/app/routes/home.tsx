import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";
import { Wallet } from "../wallet/wallet";
import { LandingPage } from "~/landing-page/landing-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Sokushuu Launchpad" },
    { name: "description", content: "Welcome to Sokushuu Launchpad!" },
  ];
}

export function loader({ context }: Route.LoaderArgs) {
  return {
    message: context.cloudflare.env.VALUE_FROM_CLOUDFLARE,
    appVersion: context.cloudflare.env.APP_VERSION,
  };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  // return <Welcome message={loaderData.message} appVersion={loaderData.appVersion} />;
  return <LandingPage />
}
