'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Mail, Copy, Download, Check, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Attendee {
  id: string;
  name: string;
  role: string;
}

interface EmailGeneratorProps {
  meetingId: string;
  attendees: Attendee[];
}

interface EmailData {
  subject: string;
  body: string;
  recipient: string;
  meetingName: string;
  date: string;
}

export default function EmailGenerator({ meetingId, attendees }: EmailGeneratorProps) {
  const [open, setOpen] = useState(false);
  const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);
  const [emailData, setEmailData] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerateEmail = async (attendee: Attendee) => {
    setLoading(true);
    setSelectedAttendee(attendee);
    setEmailData(null);

    try {
      const response = await fetch(`/api/meetings/${meetingId}/generate-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attendeeId: attendee.id,
          attendeeName: attendee.name,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate email');

      const data = await response.json();
      setEmailData(data);
    } catch (error) {
      console.error('Error generating email:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyEmail = () => {
    if (!emailData) return;

    const fullEmail = `Subject: ${emailData.subject}\n\n${emailData.body}`;
    navigator.clipboard.writeText(fullEmail);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Email copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadEmail = () => {
    if (!emailData) return;

    const fullEmail = `Subject: ${emailData.subject}\n\nTo: ${emailData.recipient}\nDate: ${emailData.date}\n\n${emailData.body}`;
    const blob = new Blob([fullEmail], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `follow-up-${emailData.recipient.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded!',
      description: 'Email saved as text file',
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#FFCC00] hover:bg-[#FFD700] text-[#090040] font-semibold">
          <Mail className="w-4 h-4 mr-2" />
          Generate Follow-up Email
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#1a0b2e] border-[#B13BFF]/50 text-white max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Generate Follow-up Email</DialogTitle>
          <DialogDescription className="text-gray-300">
            Select a team member to generate a personalized follow-up email with their action items.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!emailData ? (
            <>
              <div className="text-sm text-gray-400 mb-2">Select recipient:</div>
              <div className="grid gap-2">
                {attendees.map((attendee) => (
                  <button
                    key={attendee.id}
                    onClick={() => handleGenerateEmail(attendee)}
                    disabled={loading}
                    className="flex items-center justify-between p-4 bg-[#0d0525] hover:bg-[#16092d] border-2 border-[#B13BFF]/30 hover:border-[#B13BFF]/60 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-left">
                      <div className="font-semibold text-white">{attendee.name}</div>
                      <div className="text-sm text-gray-400">{attendee.role}</div>
                    </div>
                    {loading && selectedAttendee?.id === attendee.id && (
                      <Loader2 className="w-5 h-5 animate-spin text-[#B13BFF]" />
                    )}
                    {!loading && <Mail className="w-5 h-5 text-[#FFCC00]" />}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">To:</div>
                  <div className="font-semibold text-white">{emailData.recipient}</div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEmailData(null);
                    setSelectedAttendee(null);
                  }}
                  className="text-[#FFCC00] hover:text-white hover:bg-[#B13BFF]/20"
                >
                  ← Back to list
                </Button>
              </div>

              <div className="bg-[#0d0525] border-2 border-[#B13BFF]/30 rounded-lg p-4 space-y-4">
                <div>
                  <div className="text-sm text-gray-400 mb-1">Subject:</div>
                  <div className="font-semibold text-white">{emailData.subject}</div>
                </div>

                <div className="border-t border-[#B13BFF]/20 pt-4">
                  <div className="text-sm text-gray-400 mb-2">Message:</div>
                  <div className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
                    {emailData.body}
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  onClick={handleDownloadEmail}
                  variant="outline"
                  className="bg-[#0d0525] border-[#B13BFF]/50 text-white hover:bg-[#16092d] hover:border-[#B13BFF]"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  onClick={handleCopyEmail}
                  className="bg-[#B13BFF] hover:bg-[#9D2FE6] text-white"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
