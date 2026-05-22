// src/components/BookReader.tsx
import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  pdfUrl: string;
  title: string;
}

export default function BookReader({ pdfUrl, title }: Props) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const onLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  }, []);

  const onLoadError = useCallback((err: Error) => {
    setError('Failed to load PDF. Try downloading it directly.');
    console.error('PDF load error:', err);
  }, []);

  if (error) {
    return (
      <div className="reader-error">
        <p>{error}</p>
        <a href={pdfUrl} download className="btn btn-ghost">⬇ Download PDF</a>
      </div>
    );
  }

  return (
    <div className="reader-wrap">
      <p className="reader-title">{title}</p>
      <Document
        file={pdfUrl}
        onLoadSuccess={onLoadSuccess}
        onLoadError={onLoadError}
        loading={<div className="reader-loading">Loading PDF…</div>}
      >
        <Page pageNumber={pageNumber} width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 64 : 700, 700)} />
      </Document>

      {numPages > 0 && (
        <div className="reader-controls">
          <button
            onClick={() => setPageNumber(p => Math.max(p - 1, 1))}
            disabled={pageNumber <= 1}
            className="btn btn-ghost"
          >
            ← Prev
          </button>
          <span className="reader-page-info">Page {pageNumber} of {numPages}</span>
          <button
            onClick={() => setPageNumber(p => Math.min(p + 1, numPages))}
            disabled={pageNumber >= numPages}
            className="btn btn-ghost"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
