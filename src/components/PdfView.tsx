'use client'
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {Document, Page,pdfjs} from "react-pdf";
import {useEffect, useState} from "react";
import { Loader2Icon } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

function PdfView({url}:{url:string}) {
  const [numPages,setNumPages] = useState<number>();
  const [pageNumber,setPageNumber] = useState<number>(1);
  const [file,setFile] = useState<Blob|null>(null);
  const [rotation,setRotation] = useState<number>(0);
  const [scale,setScale] = useState<number>(1);
  useEffect(()=>{
     (async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.statusText);
        const blob = await response.blob();
        setFile(blob);
      } catch (err) {
        console.error("Failed to download PDF:", err);
      }
    })();
  },[url]);
  
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }): void => {
    setNumPages(numPages);
  }
  return (
    <div>
    {!file?(
      <Loader2Icon className="animate-spin h-20 w-20 text-indigo-600 mt-20" />
    ):(
        <Document
      loading={null}
      file={file}
      rotate={rotation}
      onLoadSuccess={onDocumentLoadSuccess}
      className="m-4 overflow-scroll"

      >
        <Page
        className="shadow-lg" scale={scale} pageNumber={pageNumber}
        ></Page>
      </Document>
    )}
    </div>
  )
}

export default PdfView