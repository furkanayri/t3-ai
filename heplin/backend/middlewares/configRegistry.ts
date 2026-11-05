import { CONFIG_KEYS } from "@/constants";

export async function configRegistry(app: App) {
    const configsObj: { [key in typeof CONFIG_KEYS[number]]: any } = {
        corsOrigins: [],
        validRedirectUrls: []
    };

    app.context.configs = (await app.context.service("configs").findAll()).results.reduce((prev, curr) => {
        return {
            ...prev,
            [curr.key]: curr.value
        }
    }, configsObj);
    console.log({ configsObj: app.context.configs })
    console.log("Configurations registered")

    return app
}