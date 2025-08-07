import { useState } from "react";
import {
  X,
  FileText,
  Image,
  BarChart3,
  FileSpreadsheet,
  FileSignature,
  ClipboardList,
  BadgePercent,
  FileType
} from "lucide-react";
import Navbar from "@/components/Navbar";
import FileUploader from "@/components/FileUploader";
import { examples, type Example } from "../components/Examples";

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [selectedExample, setSelectedExample] = useState<number | null>(null);
  const handleFileUpload = (file: File) => {
    setFile(file);
  };

  const getExampleAttributes = (title: string) => {
    switch (title.toLowerCase()) {
      case "invoice":
        return { icon: <FileText className="text-blue-600 w-5 h-5" />, bg: "bg-blue-100", border: "border-l-4 border-blue-500" };
      case "lab report":
        return { icon: <FileSpreadsheet className="text-green-600 w-5 h-5" />, bg: "bg-green-100", border: "border-l-4 border-green-500" };
      case "loan form":
        return { icon: <FileSignature className="text-purple-600 w-5 h-5" />, bg: "bg-purple-100", border: "border-l-4 border-purple-500" };
      case "performance charts":
        return { icon: <BarChart3 className="text-orange-600 w-5 h-5" />, bg: "bg-orange-100", border: "border-l-4 border-orange-500" };
      case "gst invoice hindi":
        return { icon: <ClipboardList className="text-pink-600 w-5 h-5" />, bg: "bg-pink-100", border: "border-l-4 border-pink-500" };
      case "gst invoice hindi handwritten":
        return { icon: <BadgePercent className="text-yellow-600 w-5 h-5" />, bg: "bg-yellow-100", border: "border-l-4 border-yellow-500" };
      case "gst invoice english handwritten":
        return { icon: <FileText className="text-emerald-600 w-5 h-5" />, bg: "bg-emerald-100", border: "border-l-4 border-emerald-500" };
      case "gst invoice english":
        return { icon: <FileType className="text-red-600 w-5 h-5" />, bg: "bg-red-100", border: "border-l-4 border-red-500" };
      case "bank check":
        return { icon: <FileText className="text-teal-600 w-5 h-5" />, bg: "bg-teal-100", border: "border-l-4 border-teal-500" };
      case "death certificate":
        return { icon: <ClipboardList className="text-indigo-600 w-5 h-5" />, bg: "bg-indigo-100", border: "border-l-4 border-indigo-500" };
      case "discharge summary":
        return { icon: <FileText className="text-lime-600 w-5 h-5" />, bg: "bg-lime-100", border: "border-l-4 border-lime-500" };
      case "discharge summary handwritten":
        return { icon: <FileText className="text-rose-600 w-5 h-5" />, bg: "bg-rose-100", border: "border-l-4 border-rose-500" };  
      default:
        return { icon: <Image className="text-gray-600 w-5 h-5" />, bg: "bg-gray-100", border: "border-l-4 border-gray-400" };
    }
  };

  const selectedExampleData = examples.find((e) => e.id === selectedExample);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Agentic Document Extraction</h1>
          <p className="text-muted-foreground">
            Extract structured information from visually complex documents. The API returns hierarchical structured data with location-based metadata.
          </p>
        </div>

        {/* File Upload */}
        <div className="max-w-2xl mx-auto mb-8">
          <FileUploader onFileUpload={handleFileUpload} />
        </div>

        {/* Example Files */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Example Files</h2>
            <p className="text-gray-600 text-sm">Click on any example below to see extracted data</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {examples
              .filter((example) => {
                const hostname = window.location.hostname;
                const pathname = window.location.pathname;

                // ✅ Show 1-4 and 9-12 on AutomationEdge
                if (hostname === "adp.automationedge.com" && pathname === "/uploaddoc") {
                  return [1, 2, 3, 4, 9, 10, 11, 12].includes(example.id);
                }

                // ✅ Show 1-8 on all other domains
                return example.id >= 1 && example.id <= 8;
              })
              .map((example) => {

              const { icon, bg, border } = getExampleAttributes(example.title);
              const isSelected = selectedExample === example.id;

              return (
                <div
                  key={example.id}
                  className={`rounded-md p-2 cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md ${bg} ${border} ${isSelected ? "ring-2 ring-blue-500 border-blue-300" : "border border-gray-200 hover:border-blue-300"
                    }`}
                  onClick={() => setSelectedExample(example.id)}
                >
                  <div className="aspect-square mb-2 rounded-md overflow-hidden bg-white">
                    <img
                      src={example.src}
                      alt={example.title}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex items-center justify-center space-x-1 mb-1">
                    {icon}
                    <p className="text-xs font-medium text-gray-800 truncate">{example.title}</p>
                  </div>
                  <p className="text-[10px] text-gray-600 text-center">Click to view</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Extracted Data Display */}
        {selectedExampleData && (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mt-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-400 to-yellow-300 px-4 py-3 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                {getExampleAttributes(selectedExampleData.title).icon}
                <h3 className="text-lg font-bold text-white">{selectedExampleData.title} - Extracted Data</h3>
              </div>
              <button
                onClick={() => setSelectedExample(null)}
                className="text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left - Image */}
              <div className="border-r border-gray-200 bg-gray-50">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                    <Image className="w-4 h-4 mr-2" /> Original Document
                  </h4>
                </div>
                <div className="h-96 overflow-auto p-4">
                  <img
                    src={selectedExampleData.src}
                    alt={`${selectedExampleData.title} preview`}
                    className="w-full object-contain rounded-md shadow-sm"
                  />
                </div>
              </div>

              {/* Right - JSON Data */}
              <div className="bg-white">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-900 text-sm flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-600" /> Extracted JSON Data
                  </h4>
                </div>
                <div className="h-96 overflow-auto p-4">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono leading-relaxed">
                    {JSON.stringify(selectedExampleData.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 text-center">
                This is a demo preview. Upload your own document above to test real-time extraction.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Upload;
