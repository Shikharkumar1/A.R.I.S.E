"use client"

import React from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CategoryItem {
  [key: string]: string
}

interface CategoryProps {
  title: string
  items: CategoryItem[]
  gridSpan?: string
}

const CategoryCard: React.FC<CategoryProps> = ({ title, items, gridSpan }) => {
  return (
    <Card className={`h-full ${gridSpan} bg-white/5 backdrop-blur-sm border-[#B13BFF]/30 hover:border-[#B13BFF] transition-all duration-300`}>
      <CardHeader className="border-b border-[#B13BFF]/20">
        <CardTitle className="text-white font-medium text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ScrollArea className="h-[200px] pr-4">
          {items.length === 0 ? (
            <p className="text-white/40 font-light">No items available.</p>
          ) : (
            <ul className="space-y-3">
              {items.map((item, index) => (
                <li key={index} className="bg-white/5 border border-[#471396]/30 p-3 rounded-lg hover:bg-white/10 hover:border-[#B13BFF] transition-all duration-300 transform hover:-translate-y-0.5">
                  {Object.entries(item).map(([key, value]) => {
                    const formattedKey = key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    let formattedValue = value;
                    if (key === 'due_date' && value && typeof value === 'string' && value.includes('T')) {
                      formattedValue = value.split('T')[0];
                    }
                    return (
                      <div key={key} className="mb-1 last:mb-0">
                        <strong className="text-[#FFCC00] font-medium">{formattedKey}:</strong>{' '}
                        <span className="text-white/60 font-light">{formattedValue}</span>
                      </div>
                    );
                  })}
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default CategoryCard
