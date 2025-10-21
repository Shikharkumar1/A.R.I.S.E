'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import UploadAudio from '@/components/UploadAudio';
import { useToast } from "@/hooks/use-toast"
import { Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';


interface Meeting {
  id: string;
  name: string;
  description: string;
  fileName: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const { toast } = useToast();

  const fetchMeetings = async () => {
    try {
      const response = await axios.get("/api/meetings");
      setMeetings(response.data);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setMeetings([]);
      toast({
        title: 'Error',
        description: 'Failed to fetch meetings.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleViewDetails = (meetingId: string) => {
    router.push(`dashboard/meeting/${meetingId}`);
  };

  const handleDelete = async (meetingId: string) => {
    if (confirm("Are you sure you want to delete this meeting? This action cannot be undone.")) {
      try {
        await axios.delete(`/api/meetings/${meetingId}`);
        toast({
          title: 'Success',
          description: 'Meeting deleted successfully.',
        });
        fetchMeetings(); // Refresh the meetings list
      } catch (error) {
        console.error("Error deleting meeting:", error);
        toast({
          title: 'Error',
          description: 'Failed to delete meeting.',
          variant: 'destructive',
        });
      }
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#471396] via-[#090040] to-[#471396]">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#090040]/80 border-b border-[#B13BFF]/20">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <Link href="/" className="group">
            <h1 className="text-3xl font-black tracking-tight text-white group-hover:text-[#FFCC00] transition-colors duration-300 cursor-pointer">A.R.I.S.E</h1>
          </Link>
        </div>
      </header>
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Upload Section */}
        <div className="mb-8">
          <UploadAudio onUploadSuccess={fetchMeetings} />
        </div>

        {/* Meetings List */}
        <Card className="bg-white/5 backdrop-blur-sm border-[#B13BFF]/30 shadow-2xl">
          <CardHeader className="border-b border-[#B13BFF]/20 pb-6">
            <CardTitle className="text-2xl font-semibold text-white">Your Meetings</CardTitle>
            <CardDescription className="text-white/50 font-light">
              Recent transcribed meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {meetings.length > 0 ? (
              <div className="space-y-3">
                {meetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="group bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-[#B13BFF]/30 hover:border-[#B13BFF] rounded-xl p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#B13BFF]/20"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg font-medium text-white truncate">
                          {meeting.name}
                        </h3>
                        <p className="text-sm text-white/50 font-light truncate">
                          {meeting.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(meeting.id)}
                          className="text-white hover:bg-[#B13BFF] hover:text-white border border-[#B13BFF] rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meeting.id)}
                          className="text-red-300 hover:bg-red-500 hover:text-white border border-red-500/50 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-white/40 font-light text-lg">No meetings yet</p>
                <p className="text-white/30 font-light text-sm mt-2">Upload an audio file to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
