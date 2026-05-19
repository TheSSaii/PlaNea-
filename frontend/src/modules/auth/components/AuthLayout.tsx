import type { ReactNode } from "react"

type AuthLayoutProps = {
  children: ReactNode
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white rounded-3xl shadow-md p-8">

        {children}

      </div>

    </div>
  )
}

export default AuthLayout
