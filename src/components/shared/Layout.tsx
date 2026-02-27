import type { ReactNode } from 'react'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
  /** Show sidebar — false on full-width pages like the map. */
  showSidebar?: boolean
}

/**
 * Layout — root shell shared by all authenticated and public pages.
 *
 * TODO (all teams): add toast/notification provider, modal portal, and
 *                   global loading overlay here once UI library is connected.
 */
export function Layout({ children, showSidebar = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#f5faf0]">
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
