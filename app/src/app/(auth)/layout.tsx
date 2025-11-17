import { Container } from '@/components/layout/container';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Container size="sm">
        <div className="w-full max-w-md mx-auto">
          {children}
        </div>
      </Container>
    </div>
  );
}