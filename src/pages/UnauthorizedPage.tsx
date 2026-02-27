import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-md py-16 px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <ShieldOff className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-2xl font-bold font-sg text-[#133c1d]">Access denied</h1>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            You don't have permission to view this page.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            <Link to="/dashboard">
              <Button className="h-11 w-full text-base font-medium bg-[#8cc63f] hover:bg-[#7ab32e] text-[#133c1d]">Go to Dashboard</Button>
            </Link>
            <Link to="/">
              <Button variant="outline" className="h-11 w-full text-base font-medium">Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
