import services, { IServiceRegistry } from "@/services";

export async function serviceRegistry(app: App) {
    app.context.service = <K extends keyof IServiceRegistry>(name: K) => services()[name];

    console.log("Services registered")
    return app
}