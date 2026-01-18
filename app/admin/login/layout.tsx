// This layout overrides the parent admin layout for the login page
// No auth required here
export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}

