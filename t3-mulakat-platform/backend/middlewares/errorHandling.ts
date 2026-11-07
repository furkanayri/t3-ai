import { MongooseError, CastError } from "mongoose";
import createError from 'http-errors';

async function mongooseErrorMiddleware(ctx: Context, next: Next) {
    try {
        await next();
    } catch (err) {
        console.dir(err)
        if (err instanceof MongooseError) {
            const error: any = err;
            let errorMessage = 'Mongoose error occurred';
            let errorCode = 'MONGOOSE_ERROR';
            let status = 400;

            switch (error.name) {
                case 'ValidationError':
                    errorMessage = 'Validation failed';
                    // Extract more detailed message from validation error if needed
                    break;
                case 'CastError':
                    errorMessage = `Invalid ${error.path}: ${error.value}`;
                    break;
                case 'MongoError':
                    if (error.code === 11000) {
                        errorMessage = 'Duplicate key error';
                        // Extract more detail about the duplicate key if needed
                    }
                    break;
                // Add more cases as needed for other Mongoose errors
            }

            throw createError(status, errorMessage, { code: errorCode });
        }

        // If it's not a Mongoose error, rethrow it
        throw err;
    }
}

async function errorMiddleware(ctx: Context, next: Next) {
    try {
        await next();
    } catch (err: any) {
        ctx.status = err.status || 500;
        ctx.body = {
            error_code: err.code || 'INTERNAL_SERVER_ERROR',
            message: ctx.i18n.__(err.message) // Translates error message
        };
        ctx.app.emit('error', err, ctx);
    }
}

export async function errorHandling(app: App) {
    app.use(errorMiddleware);
    app.use(mongooseErrorMiddleware);
    return app
}