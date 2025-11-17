import type { Meta, StoryObj } from '@storybook/react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const meta = {
  title: 'UI/Alert',
  component: Alert,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Alert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>
          This is an informational alert message.
        </AlertDescription>
      </>
    ),
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: (
      <>
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Something went wrong. Please try again.
        </AlertDescription>
      </>
    ),
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: (
      <>
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Please review your input before proceeding.
        </AlertDescription>
      </>
    ),
  },
};

export const Success: Story = {
  args: {
    variant: 'success',
    children: (
      <>
        <AlertTitle>Success</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </>
    ),
  },
};