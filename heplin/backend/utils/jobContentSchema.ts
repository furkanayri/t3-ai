

import { z } from 'zod';

export const jobContentSchema = z.object({
    description: z.string(),
});
