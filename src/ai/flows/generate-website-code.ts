
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating HTML, CSS, and JavaScript code to create websites based on user prompts.
 *
 * - generateWebsiteCode - A function that takes website prompts as input and returns the generated code.
 * - GenerateWebsiteCodeInput - The input type for the generateWebsiteCode function.
 * - GenerateWebsiteCodeOutput - The return type for the generateWebsiteCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWebsiteCodeInputSchema = z.object({
  websitePrompt: z.string().describe('A detailed prompt describing the desired website, including content, style, and overall aesthetic.'),
});
export type GenerateWebsiteCodeInput = z.infer<typeof GenerateWebsiteCodeInputSchema>;

const GenerateWebsiteCodeOutputSchema = z.object({
  html: z.string().describe('The generated HTML code for the website.'),
  css: z.string().describe('The generated CSS code for the website.'),
  javascript: z.string().describe('The generated JavaScript code for the website.'),
});
export type GenerateWebsiteCodeOutput = z.infer<typeof GenerateWebsiteCodeOutputSchema>;

export async function generateWebsiteCode(input: GenerateWebsiteCodeInput): Promise<GenerateWebsiteCodeOutput> {
  return generateWebsiteCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWebsiteCodePrompt',
  input: {schema: GenerateWebsiteCodeInputSchema},
  output: {schema: GenerateWebsiteCodeOutputSchema},
  prompt: `You are a world-class web developer, famous for creating massive, visually stunning, and highly animated websites that are also fully responsive and functional.

You will receive a detailed description of the desired website. Your task is to generate the complete HTML, CSS, and JavaScript code required to build a rich, multi-section single-page application that brings the user's vision to life.

Here is the website description:

{{{websitePrompt}}}

KEY INSTRUCTIONS:
1.  **Single-Page Application (SPA) Structure:**
    *   The website must be a single HTML file.
    *   Create multiple \`<section>\` elements for the different parts of the site (e.g., Home, About, Features). Give each section a unique ID.
    *   Only one section should be visible at a time. The first section should be visible by default.
    *   The navigation bar links should NOT be actual links that cause a page reload. They should trigger JavaScript to show/hide the corresponding sections. Do not use \`href\` attributes for navigation; use data attributes like \`data-target="section-id"\`.

2.  **Navigation & Active State:**
    *   Create a JavaScript function to handle clicks on navigation items. This function should:
        *   Hide all sections.
        *   Show only the section whose ID matches the clicked item's \`data-target\`.
        *   Remove an 'active' class from all navigation items.
        *   Add the 'active' class to the currently clicked navigation item.
    *   Add CSS to style the \`.active\` navigation item differently (e.g., change its color or add an underline) so the user knows where they are.

3.  **Creative & Bold Animations:**
    *   Do not generate simple, boring pages. Think outside the box. Create a "wow" factor. The user wants a massive, impressive website, not just a basic layout. If the prompt is simple, expand on it creatively.
    *   Use CSS transitions and keyframe animations liberally to make the page feel alive and engaging. Animate elements on load, on scroll (e.g., fade-in, slide-in effects), and on hover.
    *   **Crucially:** When a new section is displayed via JavaScript, any animations within that section must be re-triggered. A simple way to do this is to remove and re-add an animation class to the elements inside the new section.

4.  **Placeholders & CSS:**
    *   Use placeholder images from placehold.co (e.g., https://placehold.co/600x400.png). **IMPORTANT**: For each image, add a unique query parameter to make its URL distinct, like \`?id=1\`, \`?id=2\`, etc. This is critical for allowing individual image replacement.
    *   **Include this CSS reset rule at the top of your CSS to prevent unwanted spacing: \`body { margin: 0; }\`**

5.  **Structure & Responsiveness:** Ensure the code is well-structured, using semantic HTML. The design MUST be responsive and look great on all screen sizes, from mobile phones to desktops.

6.  **No Generic Sections:** Absolutely DO NOT include generic sections like "Contact Us" or "Subscribe to our newsletter" unless the user specifically asks for it. Focus on creating unique content sections based on the prompt.

Provide the response as a JSON object with keys "html", "css", and "javascript". Do not include markdown formatting (like \`\`\`) in the code strings themselves.
`,
});

const generateWebsiteCodeFlow = ai.defineFlow(
  {
    name: 'generateWebsiteCodeFlow',
    inputSchema: GenerateWebsiteCodeInputSchema,
    outputSchema: GenerateWebsiteCodeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
