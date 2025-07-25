'use server';

import { z } from 'zod';
import { generateWebsiteCode, GenerateWebsiteCodeOutput } from '@/ai/flows/generate-website-code';
import { applyCodeModifications } from '@/ai/flows/apply-code-modifications';
import { generateImage, GenerateImageOutput } from '@/ai/flows/generate-image';
import { enhancePrompt, EnhancePromptOutput } from '@/ai/flows/enhance-prompt';

const CodeSchema = z.object({
  html: z.string(),
  css: z.string(),
  javascript: z.string(),
});
type Code = z.infer<typeof CodeSchema>;

function parseCombinedCode(combinedCode: string): Code {
    const htmlMatch = combinedCode.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const cssMatch = combinedCode.match(/<style[^>]*>([\s\S]*)<\/style>/i);
    const jsMatch = combinedCode.match(/<script[^>]*>([\s\S]*)<\/script>/i);

    if (htmlMatch || cssMatch || jsMatch) {
      return {
        html: htmlMatch ? htmlMatch[1].trim() : '',
        css: cssMatch ? cssMatch[1].trim() : '',
        javascript: jsMatch ? jsMatch[1].trim() : '',
      };
    }

    // Fallback for markdown code blocks
    const htmlBlockMatch = combinedCode.match(/```html\n([\s\S]*?)```/);
    const cssBlockMatch = combinedCode.match(/```css\n([\s\S]*?)```/);
    const jsBlockMatch = combinedCode.match(/```javascript\n([\s\S]*?)```/);
    
    const html = htmlBlockMatch ? htmlBlockMatch[1].trim() : '';
    const css = cssBlockMatch ? cssBlockMatch[1].trim() : '';
    const javascript = jsBlockMatch ? jsBlockMatch[1].trim() : '';

    if (html || css || javascript) {
      return { html, css, javascript };
    }

    // If all parsing fails, assume the entire content is HTML.
    return { html: combinedCode, css: '', javascript: '' };
}

export async function generateCodeAction(websitePrompt: string): Promise<GenerateWebsiteCodeOutput> {
  if (!websitePrompt) {
    throw new Error('Website prompt cannot be empty.');
  }
  try {
    const result = await generateWebsiteCode({ websitePrompt });
    return result;
  } catch (error) {
    console.error("Error in generateCodeAction:", error);
    throw new Error("Failed to generate website code.");
  }
}

export async function modifyCodeAction(
  currentCode: Code,
  modificationRequest: string
): Promise<Code> {
  if (!modificationRequest) {
    throw new Error('Modification request cannot be empty.');
  }

  const originalCode = `
Here is the current code for the website:
\`\`\`html
<html>
  <head>
    <style>
${currentCode.css}
    </style>
  </head>
  <body>
    ${currentCode.html}
    <script>
      ${currentCode.javascript}
    </script>
  </body>
</html>
\`\`\`
  `;
  
  try {
    const result = await applyCodeModifications({ originalCode, modificationRequest });
    if (!result.modifiedCode) {
      throw new Error("The AI returned an empty modification. Please try again.");
    }
    return parseCombinedCode(result.modifiedCode);
  } catch (error) {
    console.error("Error in modifyCodeAction:", error);
    throw new Error("Failed to apply code modifications.");
  }
}

export async function generateImageAction(imagePrompt: string): Promise<GenerateImageOutput> {
  if (!imagePrompt) {
    throw new Error('Image prompt cannot be empty.');
  }
  try {
    const result = await generateImage({ imagePrompt });
    return result;
  } catch (error) {
    console.error("Error in generateImageAction:", error);
    throw new Error("Failed to generate image.");
  }
}

export async function enhancePromptAction(idea: string): Promise<EnhancePromptOutput> {
  if (!idea) {
    throw new Error('Idea cannot be empty.');
  }
  try {
    const result = await enhancePrompt({ idea });
    return result;
  } catch (error) {
    console.error("Error in enhancePromptAction:", error);
    throw new Error("Failed to enhance prompt.");
  }
}
