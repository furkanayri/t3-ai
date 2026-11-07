import Koa from "koa"
import { CONFIG_KEYS } from "@/constants"
import { IServiceRegistry } from "@/services"

declare global {
    type Service = <K extends keyof IServiceRegistry>(name: K) => IServiceRegistry[K]
    type ServiceFunction = (params: any) => Promise<any>;

    interface Context extends Koa.Context {
        service: Service,
        configs: { [key in typeof CONFIG_KEYS[number]]: any }
        paginated: (serviceFunction: ServiceFunction) => (ctx: Context) => Promise<any>;
        request: Koa.Request & { body: any };
    }
    interface Next extends Koa.Next { }
    interface App extends Koa<{}, Context> { }
}

export { }

