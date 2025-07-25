
'use server';

/**
 * @fileOverview This file defines a Genkit flow for enhancing a user's initial website idea into a detailed prompt.
 * 
 * - enhancePrompt - A function that takes a brief idea and returns a more descriptive website prompt.
 * - EnhancePromptInput - The input type for the enhancePrompt function.
 * - EnhancePromptOutput - The return type for the enhancePrompt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhancePromptInputSchema = z.object({
  idea: z.string().describe('The user\'s initial, brief idea for a website.'),
});
export type EnhancePromptInput = z.infer<typeof EnhancePromptInputSchema>;

const EnhancePromptOutputSchema = z.object({
  enhancedPrompt: z.string().describe('The detailed, enhanced prompt for generating the website.'),
});
export type EnhancePromptOutput = z.infer<typeof EnhancePromptOutputSchema>;

export async function enhancePrompt(input: EnhancePromptInput): Promise<EnhancePromptOutput> {
  return enhancePromptFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhancePromptSystemPrompt',
  input: {schema: EnhancePromptInputSchema},
  output: {schema: EnhancePromptOutputSchema},
  prompt: `You are an expert creative assistant that helps users flesh out their ideas for a website.
You will be given a brief, high-level idea. Your task is to expand on it with creative and specific details to generate a rich, detailed prompt that can be used to create a stunning, multi-section website.
Do NOT ask any questions. Instead, use your creativity to invent compelling details, features, and aesthetic directions.
For example, if the user says "a site for a space game", you might expand it to describe a dramatic landing page with a video background of a spaceship battle, sections for different alien factions, a gallery of concept art, and a "Join the Fleet" call to action, all with a dark, futuristic aesthetic.
Present the final output as a single, detailed paragraph.

Initial Idea: {{{idea}}}
`,
});

const enhancePromptFlow = ai.defineFlow(
  {
    name: 'enhancePromptFlow',
    inputSchema: EnhancePromptInputSchema,
    outputSchema: EnhancePromptOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
