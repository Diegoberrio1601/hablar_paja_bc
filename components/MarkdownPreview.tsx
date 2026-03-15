import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="bg-background rounded-[2.5rem] border border-border overflow-hidden h-full flex flex-col shadow-sm">
      <div className="bg-muted/30 px-8 py-4 border-b border-border flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Vista Previa</span>
        <div className="flex gap-1.5Indicator">
          <div className="w-2 h-2 rounded-full bg-red-400/20" />
          <div className="w-2 h-2 rounded-full bg-amber-400/20" />
          <div className="w-2 h-2 rounded-full bg-green-400/20" />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 md:p-12 scrollbar-thin scrollbar-thumb-muted-foreground/20">
        <div className="max-w-none serif leading-relaxed text-lg prose prose-neutral dark:prose-invert">
          {content ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 grayscale opacity-50">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mb-4"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
              <p className="font-bold italic">Empieza a escribir para previsualizar...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
