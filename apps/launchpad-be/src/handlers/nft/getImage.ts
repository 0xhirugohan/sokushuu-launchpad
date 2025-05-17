import type { Context } from 'hono'

const getImage = (c: Context) => {
    const { smartContractAddress, tokenId } = c.req.param();
    return c.json({
        image: `https://launchpad-dev-r2.sokushuu.de/images/${smartContractAddress}/${tokenId}.png`,
    });
}

export default getImage;