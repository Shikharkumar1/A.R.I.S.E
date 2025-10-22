'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface MonitoredFile {
  name: string;
  size: number;
  lastModified: string;
}

const UploadAudio: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [monitoredFiles, setMonitoredFiles] = useState<MonitoredFile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchMonitoredFiles();
    const interval = setInterval(fetchMonitoredFiles, 10000); // Poll every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchMonitoredFiles = async () => {
    try {
      const response = await fetch('/api/monitored-files');
      if (response.ok) {
        const files: MonitoredFile[] = await response.json();
        setMonitoredFiles(files);
      }
    } catch (error) {
      console.error('Error fetching monitored files:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleMonitoredFileSelect = async (fileName: string) => {
    try {
      const response = await fetch(`/api/monitored-files/${encodeURIComponent(fileName)}`);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        setSelectedFile(file);
      }
    } catch (error) {
      console.error('Error selecting monitored file:', error);
      toast({
        title: 'File Selection Failed',
        description: 'An error occurred while selecting the file.',
        variant: 'destructive',
      });
    }
  };

  const handleTranscribe = async () => {
    if (!selectedFile) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', selectedFile);
    formData.append('fullPath', selectedFile.name);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      toast({
        title: 'Success!',
        description: 'Your audio has been transcribed successfully.',
      });
      onUploadSuccess();
      setSelectedFile(null);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: 'An error occurred while transcribing the audio. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const getFileSizeMB = (file: File | null): number => {
    return file ? file.size / (1024 ** 2) : 0;
  };

  const isTranscribeDisabled = !selectedFile || isTranscribing || getFileSizeMB(selectedFile) > 25;

  return (
    <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#B13BFF]/50 shadow-2xl hover:border-[#B13BFF] transition-all duration-300">
      <CardHeader className="border-b border-[#B13BFF]/30 pb-6">
        <CardTitle className="text-2xl font-semibold text-white">Upload Audio</CardTitle>
        <CardDescription className="text-gray-300 font-light">
          Select an audio file to transcribe
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="audio-file" className="text-gray-300 font-medium text-sm">Audio File</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="bg-[#0d0525] border-[#B13BFF]/50 text-white file:bg-[#B13BFF] file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md file:font-medium hover:bg-[#16092d] hover:border-[#B13BFF] transition-all duration-300 font-light cursor-pointer"
            />
          </div>
          {selectedFile && (
            <div className="bg-[#0d0525] border-2 border-[#B13BFF]/50 rounded-lg p-4 hover:border-[#B13BFF] transition-colors duration-300">
              <p className="text-white font-normal">
                <span className="text-[#FFCC00] font-semibold">Selected:</span> {selectedFile.name}
              </p>
              <p className="text-gray-400 text-sm font-normal mt-1">
                {getFileSizeMB(selectedFile).toFixed(2)} MB
              </p>
            </div>
          )}
          {monitoredFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Monitored Files</h3>
              <div className="space-y-2">
                {monitoredFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between bg-[#0d0525] border-2 border-[#B13BFF]/50 rounded-lg p-4 hover:bg-[#16092d] hover:border-[#B13BFF] transition-all duration-300 transform hover:-translate-y-0.5">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-normal truncate">{file.name}</p>
                      <p className="text-gray-400 text-sm font-normal">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleMonitoredFileSelect(file.name)}
                      className="ml-4 bg-[#B13BFF] hover:bg-[#9D2FE6] text-white border-0 font-medium transition-all duration-300 transform hover:scale-105"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          <Button 
            onClick={handleTranscribe} 
            disabled={isTranscribeDisabled}
            className="bg-[#FFCC00] text-[#090040] hover:bg-[#FFD633] hover:shadow-lg hover:shadow-[#FFCC00]/50 font-bold py-6 text-base transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
          </Button>
          {selectedFile && getFileSizeMB(selectedFile) > 25 && (
            <p className="text-red-300 bg-red-900/20 border-2 border-red-500/50 rounded-lg p-3 text-sm font-normal">
              File size exceeds 25 MB. Please use a smaller file.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadAudio;
