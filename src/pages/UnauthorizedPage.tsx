import { Link } from 'react-router-dom'
import { Layout } from '@/components/shared/Layout'
import { Button } from '@/components/ui/button'
import { ShieldOff } from 'lucide-react'

export default function UnauthorizedPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-sm py-20 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldOff className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You don't have permission to view this page.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/dashboard">
            <Button className="w-full">Go to Dashboard</Button>
          </Link>
          <Link to="/">
            <Button variant="outline" className="w-full">Home</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}
