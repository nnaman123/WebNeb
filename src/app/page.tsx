
'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Code2, Eye, Wand2, Maximize, Minimize, Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { generateCodeAction, modifyCodeAction, generateImageAction, enhancePromptAction } from './actions';
import { CodeBlock } from '@/components/code-block';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';


interface Code {
  html: string;
  css: string;
  javascript: string;
}

type EditorMode = 'refine' | 'images';
type SelectedImage = {
  src: string;
  id: string | null;
}

export default function Home() {
  const [code, setCode] = useState<Code>({ html: '', css: '', javascript: '' });
  const [websitePrompt, setWebsitePrompt] = useState('');
  const [modificationPrompt, setModificationPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>('refine');
  
  const previewRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { toast } = useToast();

  const handleEnhancePrompt = async () => {
    if (!websitePrompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please provide an idea to enhance.',
        variant: 'destructive',
      });
      return;
    }
    setIsEnhancing(true);
    try {
      const result = await enhancePromptAction(websitePrompt);
      setWebsitePrompt(result.enhancedPrompt);
      toast({
        title: 'Prompt Enhanced!',
        description: 'Your idea has been expanded into a more detailed prompt.',
      });
    } catch (error) {
      toast({
        title: 'Enhancement Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!websitePrompt.trim()) {
      toast({
        title: 'Prompt is empty',
        description: 'Please describe the website you want to create.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setSelectedImage(null);
    try {
      const result = await generateCodeAction(websitePrompt);
      setCode(result);
      setModificationPrompt('');
    } catch (error) {
      toast({
        title: 'Generation Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleModify = async () => {
    if (!modificationPrompt.trim()) {
      toast({
        title: 'Modification request is empty',
        description: 'Please describe the changes you want to make.',
        variant: 'destructive',
      });
      return;
    }
    setIsModifying(true);
    setSelectedImage(null);
    try {
      const result = await modifyCodeAction(code, modificationPrompt);
      setCode(result);
    } catch (error) {
      toast({
        title: 'Modification Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsModifying(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({ title: 'Image prompt is empty', description: 'Please describe the image you want to create.', variant: 'destructive' });
      return;
    }
    if (!selectedImage) {
       toast({ title: 'No Image Selected', description: 'Please click on a placeholder image in the preview to select it.', variant: 'destructive' });
      return;
    }
    setIsGeneratingImage(true);
    try {
      const { imageUrl } = await generateImageAction(imagePrompt);
      
      setCode(prevCode => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = prevCode.html;

        let imageToReplace: HTMLImageElement | null = null;
        
        if (selectedImage.id) {
          imageToReplace = tempDiv.querySelector(`img[data-nebstress-id="${selectedImage.id}"]`);
        } else {
          imageToReplace = tempDiv.querySelector(`img[src="${selectedImage.src}"]`);
        }

        if (imageToReplace) {
          const newId = `nebstress-${Date.now()}`;
          imageToReplace.src = imageUrl;
          imageToReplace.setAttribute('data-nebstress-id', newId);
        }

        return {
          ...prevCode,
          html: tempDiv.innerHTML,
        };
      });

      setSelectedImage(null);
      setImagePrompt('');
      
    } catch (error) {
       toast({ title: 'Image Generation Failed', description: error instanceof Error ? error.message : 'An unknown error occurred.', variant: 'destructive' });
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  const handleExport = async () => {
    if (!hasGeneratedCode) {
      toast({
        title: 'No code to export',
        description: 'Please generate a website first.',
        variant: 'destructive',
      });
      return;
    }
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder('website');

      if (!folder) {
        throw new Error("Could not create folder in zip");
      }

      const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Exported Website</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    ${code.html}
    <script src="script.js"></script>
</body>
</html>
      `;

      folder.file("index.html", fullHtml);
      folder.file("style.css", code.css);
      folder.file("script.js", code.javascript);
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, 'website.zip');

      toast({
        title: 'Export Successful',
        description: 'Your website has been downloaded as website.zip.',
      });
    } catch (error) {
      toast({
        title: 'Export Failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };


  const hasGeneratedCode = code.html || code.css || code.javascript;

  const imageSelectionScript = `
    const style = document.createElement('style');
    style.innerHTML = \`
      img:hover { cursor: pointer; border: 2px solid #6D28D9; opacity: 0.8; }
      img.selected-image-in-preview { border: 3px solid #C026D3 !important; box-shadow: 0 0 15px #C026D3; }
    \`;
    document.head.appendChild(style);

    window.addEventListener('click', (e) => {
      if (e.target.tagName === 'IMG') {
        const imageId = e.target.getAttribute('data-nebstress-id');
        window.parent.postMessage({ type: 'image-selected', src: e.target.src, id: imageId }, '*');
        
        const currentlySelected = document.querySelector('.selected-image-in-preview');
        if (currentlySelected) {
          currentlySelected.classList.remove('selected-image-in-preview');
        }
        e.target.classList.add('selected-image-in-preview');
      }
    });
  `;

  const linkHijackScript = `
    document.addEventListener('click', function(e) {
      let target = e.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (target && target.tagName === 'A') {
        // Allow javascript: links for SPA navigation
        const href = target.getAttribute('href');
        if (href && !href.startsWith('javascript:')) {
          e.preventDefault();
        }
      }
    }, true); // Use capture phase to catch event early
  `;

  const srcDoc = `
    <html>
      <head>
        <style>${code.css}</style>
      </head>
      <body>
        ${code.html}
        <script>${linkHijackScript}</script>
        <script>${code.javascript}</script>
        ${editorMode === 'images' ? `<script>${imageSelectionScript}</script>` : ''}
      </body>
    </html>
  `;
  
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'image-selected') {
        const { src, id } = event.data;
        if (src.startsWith('data:')) {
           setSelectedImage({ src: 'data:image/... (generated)', id });
           toast({ title: 'Generated Image Selected', description: 'You can now write a new prompt to replace it.' });
        } else {
          const iframeSrc = new URL(src);
          const urlToStore = `https://${iframeSrc.hostname}${iframeSrc.pathname}${iframeSrc.search}`;
          setSelectedImage({ src: urlToStore, id });
          toast({ title: 'Placeholder Selected', description: 'A placeholder image has been selected. You can now write a prompt to replace it.' });
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleFullscreen = () => {
    if (!previewRef.current) return;

    if (!document.fullscreenElement) {
      previewRef.current.requestFullscreen().catch(err => {
        alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      document.exitFullscreen();
    }
  };
  
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  useEffect(() => {
    if (editorMode !== 'images') {
      setSelectedImage(null);
       if (iframeRef.current?.contentWindow) {
        const currentlySelected = iframeRef.current.contentWindow.document.querySelector('.selected-image-in-preview');
        if (currentlySelected) {
          currentlySelected.classList.remove('selected-image-in-preview');
        }
      }
    }
  }, [editorMode]);

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-12">
        <Logo />
        <p className="text-muted-foreground mt-2 font-headline">
          Craft stunning websites from simple text prompts.
        </p>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-8">
          <Card className="shadow-lg transition-all duration-500 ease-out hover:shadow-primary/20">
            <CardHeader>
              <CardTitle className="font-headline text-xl flex items-center gap-2">
                <Wand2 className="text-primary" />
                1. Describe Your Website
              </CardTitle>
              <CardDescription>
                Start with a brief idea, then click "Enhance" to let the AI help you write a detailed prompt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="e.g., A dramatic landing page for a space exploration game."
                className="min-h-[120px] text-base"
                value={websitePrompt}
                onChange={(e) => setWebsitePrompt(e.target.value)}
              />
              <div className="mt-4 grid grid-cols-2 gap-4">
                <Button onClick={handleEnhancePrompt} disabled={isEnhancing || isLoading} variant="outline">
                  {isEnhancing ? (
                    <>
                      <Loader2 className="animate-spin" /> Enhancing...
                    </>
                  ) : (
                    <>
                      <Sparkles /> Enhance Prompt
                    </>
                  )}
                </Button>
                <Button onClick={handleGenerate} disabled={isLoading || isEnhancing}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" /> Generating...
                    </>
                  ) : (
                    'Generate Website'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

           <div className={cn("flex flex-col gap-8 transition-opacity duration-1000 ease-in-out", hasGeneratedCode ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden xl:h-auto xl:opacity-100')}>
            <Card className="shadow-lg transition-all duration-500 ease-out hover:shadow-primary/20">
              <Tabs value={editorMode} onValueChange={(value) => setEditorMode(value as EditorMode)} className="w-full">
                <CardHeader>
                   <TabsList className='grid w-full grid-cols-2'>
                      <TabsTrigger value="refine">
                        <Wand2 className="mr-2 h-4 w-4" /> Refine with Text
                      </TabsTrigger>
                      <TabsTrigger value="images">
                        <ImageIcon className="mr-2 h-4 w-4" /> Add Pictures
                      </TabsTrigger>
                   </TabsList>
                </CardHeader>
                <TabsContent value="refine" className="m-0">
                    <CardContent>
                      <CardDescription className="mb-4">
                          Not quite right? Tell the AI what to change.
                      </CardDescription>
                      <Textarea
                          placeholder="e.g., Change the primary color to a dark blue, and add a contact form."
                          className="min-h-[120px] text-base"
                          value={modificationPrompt}
                          onChange={(e) => setModificationPrompt(e.target.value)}
                          disabled={!hasGeneratedCode || isModifying || isLoading}
                      />
                      <Button onClick={handleModify} disabled={!hasGeneratedCode || isModifying || isLoading} className="mt-4 w-full">
                          {isModifying ? (
                          <>
                              <Loader2 className="animate-spin" /> Applying Changes...
                          </>
                          ) : (
                          'Apply Changes'
                          )}
                      </Button>
                    </CardContent>
                </TabsContent>
                <TabsContent value="images" className="m-0">
                   <CardContent>
                      <CardDescription className="mb-4">
                        1. Click a placeholder image in the preview. 2. Describe the image you want.
                      </CardDescription>
                      <div className="grid gap-4">
                        <div>
                          <Label htmlFor="image-prompt">Image Prompt</Label>
                          <Input 
                            id="image-prompt"
                            placeholder="e.g., A photorealistic image of a red sports car"
                            value={imagePrompt}
                            onChange={(e) => setImagePrompt(e.target.value)}
                            disabled={isGeneratingImage || !selectedImage}
                          />
                           {selectedImage && <p className='text-xs text-muted-foreground mt-2'>Selected: <span className='font-mono break-all'>{selectedImage.src.split('?')[0].split('/').pop()}</span></p>}
                        </div>
                        <Button onClick={handleGenerateImage} disabled={!hasGeneratedCode || isGeneratingImage || !selectedImage}>
                          {isGeneratingImage ? (
                            <>
                              <Loader2 className="animate-spin" /> Generating Image...
                            </>
                          ) : (
                            'Generate and Replace Image'
                          )}
                        </Button>
                      </div>
                   </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </div>

        <div className={cn("xl:sticky xl:top-8 flex flex-col gap-8 transition-opacity duration-1000 ease-in-out", hasGeneratedCode ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden xl:h-auto xl:opacity-100')}>
          <Card className="shadow-lg transition-all duration-500 ease-out hover:shadow-primary/20">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className='flex items-center gap-2'>
                <Eye className="text-primary" />
                <CardTitle className="font-headline text-xl">
                  Preview
                </CardTitle>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
                <span className="sr-only">{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
              </Button>
            </CardHeader>
            <CardContent>
              <div ref={previewRef} className="aspect-video w-full rounded-md border bg-white">
                {hasGeneratedCode ? (
                  <iframe
                    ref={iframeRef}
                    key={srcDoc} 
                    srcDoc={srcDoc}
                    title="Website Preview"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    className="h-full w-full"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    Your website preview will appear here.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg transition-all duration-500 ease-out hover:shadow-primary/20 min-h-[75vh]">
             <CardHeader className="flex flex-row items-center justify-between">
              <div className='flex items-center gap-2'>
                <Code2 className="text-primary" />
                <CardTitle className="font-headline text-xl">
                  Code
                </CardTitle>
              </div>
              <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting || !hasGeneratedCode}>
                {isExporting ? <Loader2 className="animate-spin" /> : <Download />}
                Export
              </Button>
            </CardHeader>
            <CardContent className="h-[calc(100%-4.5rem)]">
              {hasGeneratedCode ? (
                <Tabs defaultValue="html" className="w-full h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML</TabsTrigger>
                    <TabsTrigger value="css">CSS</TabsTrigger>
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  </TabsList>
                  <TabsContent value="html" className="flex-grow min-h-0">
                    <CodeBlock code={code.html} language="html" />
                  </TabsContent>
                  <TabsContent value="css" className="flex-grow min-h-0">
                    <CodeBlock code={code.css} language="css" />
                  </TabsContent>
                  <TabsContent value="javascript" className="flex-grow min-h-0">
                    <CodeBlock code={code.javascript} language="javascript" />
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex items-center justify-center rounded-md border text-muted-foreground h-full">
                  Generated code will be displayed here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
