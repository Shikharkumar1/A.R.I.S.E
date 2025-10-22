import DashboardHeader from "@/components/DashboardHeader"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#090040] via-[#471396] to-[#090040]">
      <DashboardHeader />
      {children}
    </div>
  )
}
