import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to DocFactory</p>
      </div>
      
      <Separator />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Start creating document templates</p>
            <Button className="mt-4">Get Started</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Manage Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and edit your documents</p>
            <Button className="mt-4">View Documents</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configure your account and preferences</p>
            <Button className="mt-4">Open Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}