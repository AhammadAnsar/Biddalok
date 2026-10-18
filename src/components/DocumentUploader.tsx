import React, { useState, useRef } from 'react';
import { Upload, File, Eye, Download, X, AlertCircle } from 'lucide-react';
import { DocumentService, DocumentMetadata, fileToUint8Array, uint8ArrayToBlobUrl } from '../services/documentService';
import { generateId } from '../utils/generateId';

interface DocumentUploaderProps {
  label: string;
  ownerType: 'student' | 'staff' | 'guardian' | 'institution';
  ownerId: string;
  documentId?: string;
  onUploadSuccess?: (docId: string) => void;
  acceptedTypes?: string;
  isPdfPreview?: boolean;
}

export const DocumentUploader: React.FC<DocumentUploaderProps> = ({
  label, ownerType, ownerId, documentId, onUploadSuccess, acceptedTypes = "image/*,application/pdf", isPdfPreview = true
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File exceeds 5MB limit');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const buffer = await fileToUint8Array(file);
      const meta: DocumentMetadata = {
        id: generateId('doc_'),
        ownerType,
        ownerId,
        mimeType: file.type,
        byteSize: file.size,
        version: 1
      };

      const res = await DocumentService.storeDocument(meta, buffer);
      if (res.success && res.id) {
        onUploadSuccess?.(res.id);
        alert('Document securely saved');
      } else {
        throw new Error(res.error || 'Upload failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePreview = async () => {
    if (!documentId) return;
    try {
      const res = await DocumentService.readDocument(documentId);
      if (res.success && res.buffer && res.mimeType) {
        const url = uint8ArrayToBlobUrl(res.buffer, res.mimeType);
        setPreviewUrl(url);
        setPreviewMime(res.mimeType);
      } else {
        throw new Error(res.error || 'Failed to read document');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="border rounded p-4 flex flex-col gap-3 relative bg-white">
      <h3 className="font-semibold text-gray-700">{label}</h3>
      
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4" /> {error}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded text-sm disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {isUploading ? 'Uploading...' : 'Upload New Version'}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleUpload} 
          accept={acceptedTypes} 
          className="hidden" 
        />

        {documentId && (
          <button
            type="button"
            onClick={handlePreview}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200 rounded text-sm"
          >
            <Eye className="w-4 h-4" /> Preview
          </button>
        )}
      </div>

      {previewUrl && (
        <div className="mt-4 border rounded relative overflow-hidden bg-gray-100 min-h-[200px] flex items-center justify-center">
          <button 
            onClick={() => setPreviewUrl(null)} 
            className="absolute top-2 right-2 p-1 bg-white/80 hover:bg-white rounded-full text-gray-700 z-10"
          >
            <X className="w-4 h-4" />
          </button>
          
          {previewMime?.startsWith('image/') ? (
            <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
          ) : previewMime === 'application/pdf' && isPdfPreview ? (
            <iframe src={previewUrl} className="w-full h-[400px] border-0" title="PDF Preview" />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500">
              <File className="w-12 h-12" />
              <span>Preview not available for this file type</span>
              <a href={previewUrl} download={`document-${documentId}`} className="text-indigo-600 hover:underline">
                <Download className="w-4 h-4 inline mr-1" /> Download File
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
