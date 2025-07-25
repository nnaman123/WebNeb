'use server';

/**
 * @fileOverview Applies user-requested modifications to the generated code for a web page.
 *
 * - applyCodeModifications - A function that accepts the original code and modification requests, then returns the modified code.
 * - ApplyCodeModificationsInput - The input type for the applyCodeModifications function.
 * - ApplyCodeModificationsOutput - The return type for the applyCodeModifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ApplyCodeModificationsInputSchema = z.object({
  originalCode: z.string().describe('The original HTML, CSS, and JavaScript code to be modified.'),
  modificationRequest: z.string().describe('The user request for code modification, described in natural language.'),
});
export type ApplyCodeModificationsInput = z.infer<typeof ApplyCodeModificationsInputSchema>;

const ApplyCodeModificationsOutputSchema = z.object({
  modifiedCode: z.string().describe('The modified HTML, CSS, and JavaScript code after applying the requested changes.'),
});
export type ApplyCodeModificationsOutput = z.infer<typeof ApplyCodeModificationsOutputSchema>;

export async function applyCodeModifications(input: ApplyCodeModificationsInput): Promise<ApplyCodeModificationsOutput> {
  return applyCodeModificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'applyCodeModificationsPrompt',
  input: {schema: ApplyCodeModificationsInputSchema},
  output: {schema: ApplyCodeModificationsOutputSchema},
  prompt: `You are a senior web developer. The user will provide you with the original HTML, CSS, and JavaScript code for a website, along with a modification request in natural language. You need to apply the changes to the code and return the modified code.

Original Code:
\`\`\`html
{{{originalCode}}}
\`\`\`

Modification Request:
{{{modificationRequest}}}

Modified Code:
`,
});

const applyCodeModificationsFlow = ai.defineFlow(
  {
    name: 'applyCodeModificationsFlow',
    inputSchema: ApplyCodeModificationsInputSchema,
    outputSchema: ApplyCodeModificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {modifiedCode: output!.modifiedCode!};
  }
);
