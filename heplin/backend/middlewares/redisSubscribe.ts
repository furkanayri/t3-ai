import { redisSubscriber } from "@/utils";

export async function redisSubscribe(app: App) {
    redisSubscriber.subscribe('documentSaved', (message) => {
        console.log('documentSaved', message);
    });
}