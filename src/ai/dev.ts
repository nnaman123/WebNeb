import { config } from 'dotenv';
config();

import '@/ai/flows/generate-website-code.ts';
import '@/ai/flows/apply-code-modifications.ts';
import '@/ai/flows/generate-image.ts';
import '@/ai/flows/enhance-prompt.ts';
