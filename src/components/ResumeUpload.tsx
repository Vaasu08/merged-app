import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ResumeUploadProps {
  onFileSelect: (file: File) => void;
}

export default function ResumeUpload({ onFileSelect }: ResumeUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0 && acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  // Correct accept format for react-dropzone v12+
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    maxSize: 10485760, // 10MB
  });

  return (
    <Card
      {...getRootProps()}
      className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      {acceptedFiles.length > 0 && acceptedFiles[0] ? (
        <div className="flex flex-col items-center">
          <FileText className="w-12 h-12 text-primary mb-3" />
          <p className="font-medium">{acceptedFiles[0].name}</p>
          <p className="text-sm text-gray-500 mt-1">
            {(acceptedFiles[0].size / 1024).toFixed(2)} KB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <Upload className="w-12 h-12 text-gray-400 mb-3" />
          <p className="font-medium">
            {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            or click to browse (PDF, DOCX - Max 10MB)
          </p>
        </div>
      )}
    </Card>
  );
}