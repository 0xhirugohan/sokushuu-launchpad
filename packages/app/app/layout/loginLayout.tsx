import { useConnect } from "wagmi";

import { Button } from "~/components/button";
import { walletConfig } from "~/libs/wallet";

const LoginLayout = () => {
    const { connectors, connect } = useConnect({ config: walletConfig });

    const handleConnect = async () => {
        connect({ connector: connectors[0] });
    }

    return <div className="flex flex-col gap-y-8">
        <p>You need to connect your wallet before access this page</p>

        <Button onClick={handleConnect}>Connect Wallet</Button>
    </div>
};

export { LoginLayout };