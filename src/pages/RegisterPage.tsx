import { Layout } from '@/components/shared/Layout'
// TODO (Member 4): import useRegisterMutation from authApi and wire form submit

/**
 * RegisterPage — new account creation form.
 *
 * TODO (Member 4):
 *  - Wire up useRegisterMutation hook
 *  - On success: show "check your email" confirmation, redirect to /login
 *  - Show field-level 422 errors (email already taken, password rules)
 */
export default function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO (Member 4): dispatch register mutation
  }

  return (
    <Layout>
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join SolarSpot and start sharing stations
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* TODO (Member 4): replace with shadcn Input + Zod validation */}
          <input type="text"     name="displayName" placeholder="Display name" className="border rounded px-3 py-2 text-sm w-full" />
          <input type="email"    name="email"        placeholder="Email"        className="border rounded px-3 py-2 text-sm w-full" />
          <input type="password" name="password"     placeholder="Password"     className="border rounded px-3 py-2 text-sm w-full" />

          <button type="submit" className="rounded bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Create account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <a href="/login" className="underline">Sign in</a>
        </p>
      </div>
    </Layout>
  )
}
