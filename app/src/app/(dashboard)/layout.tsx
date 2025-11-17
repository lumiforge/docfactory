import { ProtectedRoute } from '@/components/auth/protected-route';
import { Container } from '@/components/layout/container';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Stack } from '@/components/layout/stack';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/toast';
import { AuthProvider } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <Toaster />
        <div className="flex h-screen w-full overflow-hidden">
      <Sidebar>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Separator />
          <nav className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Templates
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Documents
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Settings
            </Button>
          </nav>
        </div>
      </Sidebar>
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header>
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">DocFactory</h1>
            <div className="ml-auto flex items-center space-x-2">
              <Button variant="outline">Profile</Button>
            </div>
          </div>
        </Header>
        
        <main className="flex-1 overflow-y-auto p-6">
          <Container>
            {children}
          </Container>
        </main>
        </div>
      </div>
      </ProtectedRoute>
    </AuthProvider>
  );
}