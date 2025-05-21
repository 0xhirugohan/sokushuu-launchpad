import { Context } from 'hono'
import { AwsClient } from 'aws4fetch'

type Bindings = {
    R2_ENDPOINT: string;
    R2_ACCESS_KEY: string;
    R2_SECRET_KEY: string;
}

const uploadImage = async (c: Context<{ Bindings: Bindings }>) => {
    const formData = await c.req.formData();
    
    if (!formData.get('hash')) {
        c.status(400);
        return c.json({
            ok: false,
            message: 'Transaction hash is not found'
        })
    }

    const image = formData.get("image") as string;
    const imageMimetype = formData.get("image_mimetype") as string;
    const nftContractAddress = formData.get("nft_contract_address");
    const nftTokenId = formData.get("nft_token_id");

    if (!nftTokenId) {
        c.status(400);
        return c.json({
            ok: false,
            error: "Token ID should not be empty or Token ID not found",
        })
    }

    try {
        const client = new AwsClient({
            service: "s3",
            region: "auto",
            accessKeyId: c.env.R2_ACCESS_KEY,
            secretAccessKey: c.env.R2_SECRET_KEY,
        });

        const key = `${nftContractAddress?.toString().toLocaleLowerCase()}/${nftTokenId}.png`;
        const signedUrl = await client.sign(
        new Request(`${c.env.R2_ENDPOINT}/sokushuu-launchpad-dev-r2/images/${key}?X-Amz-Expires=${3600}`, {
                method: 'PUT',
            }),
            {
                aws: {
                    signQuery: true,
                    service: "s3",
                    accessKeyId: c.env.R2_ACCESS_KEY,
                    secretAccessKey: c.env.R2_SECRET_KEY,
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

        return c.json({
            ok: true,
            message: 'Image uploaded',
        })
    } catch (err) {
        console.log({ err })
        c.status(500);
        return c.json({
            ok: false,
            message: 'There is something wrong in the server side. Please try again or report if error still happening.'
        })
    }
}

export default uploadImage;