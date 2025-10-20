'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast"
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

interface MonitoredFile {
  name: string;
  size: number;
  lastModified: string;
}

const UploadAudio: React.FC<{ onUploadSuccess: () => void }> = ({ onUploadSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
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
      setCompressedFile(null);
    }
  };

  const handleMonitoredFileSelect = async (fileName: string) => {
    try {
      const response = await fetch(`/api/monitored-files/${encodeURIComponent(fileName)}`);
      if (response.ok) {
        const blob = await response.blob();
        const file = new File([blob], fileName, { type: blob.type });
        setSelectedFile(file);
        setCompressedFile(null);
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

  const loadFFmpeg = async () => {
    if (!ffmpeg.loaded) {
      await ffmpeg.load();
    }
  };

  const compressAudio = async () => {
    if (!selectedFile) return;
    setIsCompressing(true);
    try {
      await loadFFmpeg();
      await ffmpeg.writeFile('input_audio', await fetchFile(selectedFile));

      // Set target bitrate to reduce file size
      // Adjust parameters as needed
      await ffmpeg.exec([
        '-i',
        'input_audio',
        '-ar',
        '16000',
        '-ac',
        '1',
        '-b:a',
        '16k',
        'output_audio.mp3'
      ]);

      const data = await ffmpeg.readFile('output_audio.mp3');
      const compressedBlob = new Blob([data as BlobPart], { type: 'audio/mpeg' });
      const compressed = new File([compressedBlob], `compressed_${selectedFile.name}`, {
        type: 'audio/mpeg',
      });

      setCompressedFile(compressed);
      toast({
        title: 'Compression Successful',
        description: `File size reduced to ${(compressed.size / (1024 * 1024)).toFixed(2)} MB`,
      });
    } catch (error) {
      console.error('Compression error:', error);
      toast({
        title: 'Compression Failed',
        description: 'An error occurred while compressing the audio.',
        variant: 'destructive',
      });
    } finally {
      setIsCompressing(false);
    }
  };

  const handleTranscribe = async () => {
    const fileToUpload = compressedFile || selectedFile;
    if (!fileToUpload) return;

    setIsTranscribing(true);
    const formData = new FormData();
    formData.append('audio', fileToUpload);
    formData.append('fullPath', fileToUpload.name);

    try {
      await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });
      toast({
        title: 'Transcription Started',
        description: 'Your audio is being transcribed.',
      });
      onUploadSuccess();
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: 'Transcription Failed',
        description: 'An error occurred while transcribing the audio.',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
      setSelectedFile(null);
      setCompressedFile(null);
    }
  };

  const getFileSizeMB = (file: File | null): number => {
    return file ? file.size / (1024 ** 2) : 0;
  };

  const isCompressionNeeded = selectedFile && getFileSizeMB(selectedFile) > 24;
  const isTranscribeDisabled =
    (selectedFile && getFileSizeMB(selectedFile) > 24 && (!compressedFile || getFileSizeMB(compressedFile) > 24)) ||
    isCompressing ||
    isTranscribing;

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10 shadow-2xl">
      <CardHeader className="border-b border-white/5 pb-6">
        <CardTitle className="text-2xl font-light text-white">Upload Audio</CardTitle>
        <CardDescription className="text-white/50 font-light">
          Select an audio file to transcribe
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <Label htmlFor="audio-file" className="text-white/70 font-light text-sm">Audio File</Label>
            <Input
              id="audio-file"
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="bg-white/5 border-white/10 text-white file:bg-white/10 file:text-white file:border-0 file:mr-4 file:py-2 file:px-4 file:rounded-md hover:bg-white/10 transition-colors font-light"
            />
          </div>
          {selectedFile && (
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <p className="text-white/80 font-light">
                <span className="text-white/50">Selected:</span> {selectedFile.name}
              </p>
              <p className="text-white/50 text-sm font-light mt-1">
                {getFileSizeMB(selectedFile).toFixed(2)} MB
              </p>
            </div>
          )}
          {monitoredFiles.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-light text-white">Monitored Files</h3>
              <div className="space-y-2">
                {monitoredFiles.map((file) => (
                  <div key={file.name} className="flex items-center justify-between bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-white/80 font-light truncate">{file.name}</p>
                      <p className="text-white/50 text-sm font-light">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <Button 
                      onClick={() => handleMonitoredFileSelect(file.name)}
                      className="ml-4 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-light"
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isCompressionNeeded && (
            <Button 
              onClick={compressAudio} 
              disabled={isCompressing}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-light"
            >
              {isCompressing ? 'Compressing...' : 'Compress Audio'}
            </Button>
          )}
          {compressedFile && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <p className="text-green-300 font-light">
                <span className="text-green-200/70">Compressed:</span> {compressedFile.name}
              </p>
              <p className="text-green-300/70 text-sm font-light mt-1">
                {getFileSizeMB(compressedFile).toFixed(2)} MB
              </p>
            </div>
          )}
          <Button 
            onClick={handleTranscribe} 
            disabled={isTranscribeDisabled}
            className="bg-white text-[#301934] hover:bg-white/90 font-medium py-6 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTranscribing ? 'Transcribing...' : 'Transcribe Audio'}
          </Button>
          {isTranscribeDisabled && selectedFile && getFileSizeMB(compressedFile || selectedFile) > 24 && (
            <p className="text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm font-light">
              File size exceeds 24 MB. Please compress the file before transcribing.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UploadAudio;
