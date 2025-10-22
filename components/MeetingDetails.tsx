"use client"

import React from "react"
import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  Flag,
  AlertCircle,
  Lightbulb,
  Calendar,
  Users,
  List,
  AlertTriangle,
  FileText,
  Download,
} from "lucide-react"
import CategoryCard from "@/components/CategoryCard"
import EmailGenerator from "@/components/EmailGenerator"
import axios from "axios"
import { useToast } from "@/hooks/use-toast"

interface CategoryItem {
  [key: string]: string
}

interface MeetingDetailsProps {
  data: {
    id: string
    name: string
    description: string
    transcript: string
    summary: string
    breakdown: {
      Tasks: { task: string; owner: string; due_date: string }[]
      Decisions: { decision: string; details: string }[]
      Questions: { question: string; status: string; answer?: string }[]
      Insights: { insight: string; reference: string }[]
      Deadlines: { deadline: string; related_to: string }[]
      Attendees: { name: string; role: string }[]
      "Follow-ups": { follow_up: string; owner: string; due_date: string }[]
      Risks: { risk: string; impact: string }[]
    }
  }
}

export default function MeetingDetails({ data }: MeetingDetailsProps) {
  const { toast } = useToast()

  const categories = [
    { title: "Tasks", icon: CheckCircle, items: data.breakdown.Tasks || [], gridSpan: "col-span-2" },
    { title: "Decisions", icon: Flag, items: data.breakdown.Decisions || [], gridSpan: "col-span-2" },
    { title: "Questions", icon: AlertCircle, items: data.breakdown.Questions || [], gridSpan: "col-span-2" },
    { title: "Insights", icon: Lightbulb, items: data.breakdown.Insights || [], gridSpan: "col-span-2" },
    { title: "Deadlines", icon: Calendar, items: data.breakdown.Deadlines || [], gridSpan: "col-span-1" },
    { title: "Attendees", icon: Users, items: data.breakdown.Attendees || [], gridSpan: "col-span-1" },
    { title: "Follow-ups", icon: List, items: data.breakdown["Follow-ups"] || [], gridSpan: "col-span-2" },
    { title: "Risks", icon: AlertTriangle, items: data.breakdown.Risks || [], gridSpan: "col-span-2" },
  ]

  const handleExport = async () => {
    try {
      const response = await axios.get(`/api/meetings/${data.id}/export`, {
        responseType: 'blob',
      })

      if (response.status === 200) {
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `${data.name.replace(/\s+/g, '_')}_Details.docx`)
        document.body.appendChild(link)
        link.click()
        link.parentNode?.removeChild(link)
        toast({
          title: "Success",
          description: "Meeting details exported successfully!",
        })
      }
    } catch (error: any) {
      console.error(error)
      toast({
        title: "Error",
        description: "Failed to export meeting details.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-white mb-2">{data.name}</h1>
          <p className="text-white/50 font-light">{data.description}</p>
        </div>
        <div className="flex gap-2">
          <EmailGenerator 
            meetingId={data.id} 
            attendees={data.breakdown.Attendees.map((att, idx) => ({
              id: `${data.id}-${idx}`,
              name: att.name,
              role: att.role
            })) || []} 
          />
          <button
            onClick={handleExport}
            className="flex items-center px-5 py-2.5 bg-[#B13BFF] hover:bg-[#9D2FE6] text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-[#B13BFF]/50"
          >
            <Download className="mr-2" size={18} />
            Export Details
          </button>
        </div>
      </div>
      
      <Tabs defaultValue="summary" className="space-y-6">
        <TabsList className="bg-white/5 backdrop-blur-sm border border-[#B13BFF]/30 p-1">
          <TabsTrigger 
            value="summary" 
            className="data-[state=active]:bg-[#B13BFF] data-[state=active]:text-white text-white/60 font-medium transition-all duration-300"
          >
            Summary
          </TabsTrigger>
          <TabsTrigger 
            value="details"
            className="data-[state=active]:bg-[#B13BFF] data-[state=active]:text-white text-white/60 font-medium transition-all duration-300"
          >
            Details
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-6 mt-6">
          <Card className="bg-white/5 backdrop-blur-sm border-[#B13BFF]/30 hover:border-[#B13BFF] transition-colors duration-300">
            <CardHeader className="border-b border-[#B13BFF]/20">
              <CardTitle className="flex items-center gap-2 text-white font-medium text-xl">
                <FileText className="w-5 h-5 text-[#B13BFF]" />
                <span>Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-white/70 font-light leading-relaxed">{data.summary}</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 backdrop-blur-sm border-[#B13BFF]/30 hover:border-[#B13BFF] transition-colors duration-300">
            <CardHeader className="border-b border-[#B13BFF]/20">
              <CardTitle className="flex items-center gap-2 text-white font-medium text-xl">
                <FileText className="w-5 h-5 text-[#B13BFF]" />
                <span>Transcript</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ScrollArea className="h-[300px] rounded-lg bg-white/5 p-4 border border-[#471396]/30">
                <p className="text-white/60 font-light leading-relaxed whitespace-pre-wrap">{data.transcript}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                className={category.gridSpan}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CategoryCard
                  title={category.title}
                  items={category.items}
                  gridSpan={category.gridSpan}
                />
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
