import { Button } from '@/components/ui/button';

interface AuthComponentProps {
  onLogin: () => void;
  onSignup: () => void;
}

export function AuthComponent({ onLogin, onSignup }: AuthComponentProps) {
  return (
    <div className="space-y-4">
      <h2>Authentication</h2>
      <div className="flex space-x-4">
        <Button onClick={onLogin}>Login</Button>
        <Button onClick={onSignup} variant="outline">Sign Up</Button>
      </div>
    </div>
  );
}