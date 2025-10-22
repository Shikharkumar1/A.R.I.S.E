'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Eye, Trash2, Search, TrendingUp, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


interface Meeting {
  id: string;
  name: string;
  description: string;
  fileName: string;
  createdAt: string;
  tasks?: any[];
  decisions?: any[];
  questions?: any[];
  attendees?: any[];
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [showAnalytics, setShowAnalytics] = useState(true);
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

  // Filter and search logic
  const filteredMeetings = useMemo(() => {
    let filtered = meetings;

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(meeting => {
        const meetingDate = new Date(meeting.createdAt);
        const diffTime = Math.abs(now.getTime() - meetingDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'today':
            return diffDays <= 1;
          case 'week':
            return diffDays <= 7;
          case 'month':
            return diffDays <= 30;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(meeting => 
        meeting.name.toLowerCase().includes(query) ||
        meeting.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [meetings, searchQuery, dateFilter]);

  // Analytics data
  const analyticsData = useMemo(() => {
    const totalMeetings = meetings.length;
    const totalTasks = meetings.reduce((sum, m) => sum + (m.tasks?.length || 0), 0);
    const totalDecisions = meetings.reduce((sum, m) => sum + (m.decisions?.length || 0), 0);
    const totalAttendees = new Set(meetings.flatMap(m => m.attendees?.map(a => a.name) || [])).size;
    
    // Meetings by week
    const weeklyData = meetings.reduce((acc, meeting) => {
      const date = new Date(meeting.createdAt);
      const weekKey = `Week ${Math.ceil(date.getDate() / 7)}`;
      acc[weekKey] = (acc[weekKey] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const chartData = Object.entries(weeklyData).map(([name, count]) => ({ name, meetings: count }));

    return {
      totalMeetings,
      totalTasks,
      totalDecisions,
      totalAttendees,
      chartData,
    };
  }, [meetings]);

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
    <main className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Upload Section */}
        <div className="mb-8">
          <UploadAudio onUploadSuccess={fetchMeetings} />
        </div>

        {/* Analytics Section */}
        {showAnalytics && meetings.length > 0 && (
          <div className="mb-8 space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#B13BFF]/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Total Meetings</p>
                      <p className="text-4xl font-bold text-white mt-2">{analyticsData.totalMeetings}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-[#B13BFF]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#FFCC00]/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Total Tasks</p>
                      <p className="text-4xl font-bold text-white mt-2">{analyticsData.totalTasks}</p>
                    </div>
                    <CheckCircle2 className="w-12 h-12 text-[#FFCC00]" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a0b2e] backdrop-blur-sm border-emerald-400/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Decisions Made</p>
                      <p className="text-4xl font-bold text-white mt-2">{analyticsData.totalDecisions}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[#1a0b2e] backdrop-blur-sm border-cyan-400/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-300 text-sm font-medium">Team Members</p>
                      <p className="text-4xl font-bold text-white mt-2">{analyticsData.totalAttendees}</p>
                    </div>
                    <AlertCircle className="w-12 h-12 text-cyan-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart */}
            {analyticsData.chartData.length > 0 && (
              <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#B13BFF]/50">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">Meeting Activity</CardTitle>
                  <CardDescription className="text-gray-300">Meetings over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analyticsData.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#B13BFF40" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#ffffff" 
                        style={{ fontSize: '14px', fill: '#ffffff' }}
                      />
                      <YAxis 
                        stroke="#ffffff" 
                        style={{ fontSize: '14px', fill: '#ffffff' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1a0b2e', 
                          border: '2px solid #B13BFF',
                          borderRadius: '8px',
                          color: '#ffffff',
                          padding: '12px'
                        }}
                        labelStyle={{ color: '#ffffff', fontWeight: 'bold', marginBottom: '4px' }}
                        itemStyle={{ color: '#B13BFF' }}
                        cursor={{ fill: '#B13BFF20' }}
                      />
                      <Bar dataKey="meetings" fill="#B13BFF" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Search and Filter */}
        <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#B13BFF]/50 shadow-2xl mb-4">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[#0d0525] border-[#B13BFF]/50 text-white placeholder:text-gray-400 focus:border-[#B13BFF] focus:ring-2 focus:ring-[#B13BFF]/20"
                />
              </div>

              {/* Date Filter */}
              <div className="flex gap-2">
                {(['all', 'today', 'week', 'month'] as const).map((filter) => (
                  <Button
                    key={filter}
                    variant={dateFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateFilter(filter)}
                    className={dateFilter === filter 
                      ? "bg-[#B13BFF] hover:bg-[#9D2FE6] text-white border-[#B13BFF] font-medium" 
                      : "bg-[#0d0525] hover:bg-[#1a0b2e] text-gray-300 border-[#B13BFF]/50 hover:border-[#B13BFF] hover:text-white font-medium"}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </Button>
                ))}
              </div>

              {/* Toggle Analytics */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="bg-[#0d0525] hover:bg-[#1a0b2e] text-gray-300 border-[#B13BFF]/50 hover:border-[#B13BFF] hover:text-white font-medium"
              >
                {showAnalytics ? 'Hide' : 'Show'} Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Meetings List */}
        <Card className="bg-[#1a0b2e] backdrop-blur-sm border-[#B13BFF]/50 shadow-2xl">
          <CardHeader className="border-b border-[#B13BFF]/30 pb-6">
            <CardTitle className="text-2xl font-semibold text-white">
              Your Meetings 
              {filteredMeetings.length !== meetings.length && (
                <span className="text-sm font-normal text-gray-400 ml-2">
                  ({filteredMeetings.length} of {meetings.length})
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-gray-300 font-light">
              Recent transcribed meetings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {filteredMeetings.length > 0 ? (
              <div className="space-y-3">
                {filteredMeetings.map((meeting) => (
                  <div
                    key={meeting.id}
                    className="group bg-[#0d0525] hover:bg-[#16092d] backdrop-blur-sm border border-[#B13BFF]/50 hover:border-[#B13BFF] rounded-xl p-5 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg hover:shadow-[#B13BFF]/30"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0 space-y-1">
                        <h3 className="text-lg font-semibold text-white truncate">
                          {meeting.name}
                        </h3>
                        <p className="text-sm text-gray-300 font-normal truncate">
                          {meeting.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(meeting.id)}
                          className="text-white hover:bg-[#B13BFF] hover:text-white border-2 border-[#B13BFF] rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(meeting.id)}
                          className="text-red-300 hover:bg-red-600 hover:text-white border-2 border-red-500 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : meetings.length > 0 ? (
              <div className="text-center py-16">
                <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300 font-medium text-lg">No meetings match your filters</p>
                <p className="text-gray-400 font-normal text-sm mt-2">Try adjusting your search or date filter</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-300 font-medium text-lg">No meetings yet</p>
                <p className="text-gray-400 font-normal text-sm mt-2">Upload an audio file to get started</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
  );
};

export default Dashboard;
