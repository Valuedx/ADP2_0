import React from 'react';

interface HTMLRendererProps {
  htmlContent: string;
  className?: string;
}

const HTMLRenderer: React.FC<HTMLRendererProps> = ({ htmlContent, className = '' }) => {
  // Create a safe HTML content by ensuring it doesn't contain script tags or other dangerous elements
  const createSafeHTML = (content: string) => {
    // Remove any script tags and other potentially dangerous elements
    const cleanedContent = content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/onload=/gi, 'data-onload=')
      .replace(/onerror=/gi, 'data-onerror=')
      .replace(/onclick=/gi, 'data-onclick=');

    return cleanedContent;
  };

  const safeHTML = createSafeHTML(htmlContent);

  return (
    <div
      className={`html-renderer prose prose-sm max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  );
};

export default HTMLRenderer;
