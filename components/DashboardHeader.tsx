import { auth, signOut } from "@/lib/auth"
import { Button } from "./ui/button"
import { LogOut, User } from "lucide-react"
import Link from "next/link"

export default async function DashboardHeader() {
  const session = await auth()

  return (
    <header className="border-b border-[#B13BFF]/30 bg-[#1a0b2e]/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center space-x-2 group">
          <span className="text-3xl font-black tracking-tight text-white group-hover:text-[#FFCC00] transition-colors duration-300">
            A.R.I.S.E
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          {session?.user && (
            <>
              <div className="flex items-center gap-2 text-gray-300">
                <User className="w-4 h-4" />
                <span className="text-sm">{session.user.name || session.user.email}</span>
              </div>
              <form
                action={async () => {
                  "use server"
                  await signOut({ redirectTo: "/" })
                }}
              >
                <Button
                  type="submit"
                  variant="ghost"
                  className="text-gray-300 hover:text-white hover:bg-[#B13BFF]/20"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
