import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'
import { ApiStatusBanner } from './ApiStatusBanner'

interface LayoutProps {
  children: ReactNode
  
  showSidebar?: boolean
}


export function Layout({ children, showSidebar = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5faf0]">
      <Navbar />
      <ApiStatusBanner />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
