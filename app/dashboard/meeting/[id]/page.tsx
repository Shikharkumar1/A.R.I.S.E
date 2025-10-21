'use client';

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import MeetingDetails from "@/components/MeetingDetails";

interface MeetingData {
  id: string;
  name: string;
  description: string;
  transcript: string;
  summary: string;
  breakdown: {
    Tasks: { task: string; owner: string; due_date: string }[];
    Decisions: { decision: string; details: string }[];
    Questions: { question: string; status: string; answer?: string }[];
    Insights: { insight: string; reference: string }[];
    Deadlines: { deadline: string; related_to: string }[];
    Attendees: { name: string; role: string }[];
    "Follow-ups": { follow_up: string; owner: string; due_date: string }[];
    Risks: { risk: string; impact: string }[];
  };
}
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;
  const [data, setData] = useState<MeetingData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Fetching meeting details for ID:", meetingId);
    if (meetingId) {
      axios
        .get(`/api/meetings/${meetingId}`)
        .then((response) => {
          console.log("Received meeting data:", response.data);
          setData({ ...response.data, id: meetingId });
        })
        .catch((error) => {
          console.error("Error fetching meeting details:", error);
          if (error.response && error.response.status === 404) {
            setError("Meeting not found.");
          } else {
            setError("Failed to fetch meeting details.");
          }
        });
    }
  }, [meetingId]);

  const handleGoBack = () => {
    router.push('/dashboard');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#471396] via-[#090040] to-[#471396]">
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[#090040]/80 border-b border-[#B13BFF]/20">
          <div className="container mx-auto px-6 h-16 flex items-center">
            <h1 className="text-3xl font-black tracking-tight text-white">A.R.I.S.E</h1>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8">
          <button 
            onClick={handleGoBack} 
            className="mb-6 flex items-center text-white/70 hover:text-[#FFCC00] transition-all duration-300 font-medium transform hover:translate-x-[-4px]"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </button>
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 text-red-300 font-light">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#471396] via-[#090040] to-[#471396]">
        <header className="sticky top-0 z-30 backdrop-blur-md bg-[#090040]/80 border-b border-[#B13BFF]/20">
          <div className="container mx-auto px-6 h-16 flex items-center">
            <h1 className="text-3xl font-black tracking-tight text-white">A.R.I.S.E</h1>
          </div>
        </header>
        <div className="container mx-auto px-6 py-8">
          <button 
            onClick={handleGoBack} 
            className="mb-6 flex items-center text-white/70 hover:text-[#FFCC00] transition-all duration-300 font-medium transform hover:translate-x-[-4px]"
          >
            <ArrowLeft className="mr-2" size={20} />
            Back to Dashboard
          </button>
          <div className="text-white/70 font-light">Loading...</div>
        </div>
      </div>
    );
  }

  console.log("Rendering MeetingDetails with data:", data);
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#471396] via-[#090040] to-[#471396]">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-[#090040]/80 border-b border-[#B13BFF]/20">
        <div className="container mx-auto px-6 h-16 flex items-center">
          <h1 className="text-3xl font-black tracking-tight text-white">A.R.I.S.E</h1>
        </div>
      </header>
      <div className="container mx-auto px-6 py-8">
        <button 
          onClick={handleGoBack} 
          className="mb-6 flex items-center text-white/70 hover:text-[#FFCC00] transition-all duration-300 font-medium transform hover:translate-x-[-4px]"
        >
          <ArrowLeft className="mr-2" size={20} />
          Back to Dashboard
        </button>
        <MeetingDetails data={data} />
      </div>
    </div>
  );
}
