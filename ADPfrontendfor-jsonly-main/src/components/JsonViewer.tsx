import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface JsonViewerProps {
  documentName: string;
  documentId: string | undefined;
}

const JsonViewer = ({ documentId, documentName }: JsonViewerProps) => {
  const [copied, setCopied] = useState(false);
  const [documentData, setDocumentData] = useState<Record<string, unknown> | null>(null);
  const { handleError } = useErrorHandler();
  
  // Use useEffect to load data when component mounts or documentId changes
  useEffect(() => {
    console.log("JsonViewer - Loading data for document ID:", documentId);
    
    try {
      // Log all localStorage keys for debugging
      console.log("All localStorage keys:", Object.keys(localStorage));
      
      const storageKey = `document_${documentId}`;
      console.log("Looking for storage key:", storageKey);
      
      const storedData = localStorage.getItem(storageKey);
      console.log("Raw data from localStorage:", storedData);
      
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Parsed data:", parsedData);
        setDocumentData(parsedData);
      } else {
        handleError({ message: 'Document data not found in localStorage' });
      }
    } catch (error) {
      handleError(error as { status?: number; message?: string }, 'Error retrieving document data');
    }
  }, [documentId, handleError]);

  const handleCopy = () => {
    if (!documentData) return;
    
    const jsonString = JSON.stringify(documentData, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("JSON copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!documentData) return;
    
    const jsonString = JSON.stringify(documentData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentName.split(".")[0]}_extracted.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON file downloaded");
  };

  // If no data found
  if (!documentData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-medium">Extracted Data</h3>
        </div>
        <div className="flex items-center justify-center h-full flex-col p-4">
          <p className="text-muted-foreground mb-2">Document data not found</p>
          <p className="text-xs text-muted-foreground">
            Document ID: {documentId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-medium">Extracted Data</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button size="sm" className="flex items-center gap-1" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            <span>Download JSON</span>
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <pre className="p-4 text-sm json-content overflow-x-auto">
          {JSON.stringify(documentData, null, 2)}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default JsonViewer;