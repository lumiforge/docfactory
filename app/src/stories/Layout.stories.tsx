import type { Meta, StoryObj } from '@storybook/react';
import { Container } from '@/components/layout/container';
import { Grid } from '@/components/layout/grid';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Stack } from '@/components/layout/stack';

const containerMeta = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Container>;

const sidebarMeta = {
  title: 'Layout/Sidebar',
  component: Sidebar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Sidebar>;

const headerMeta = {
  title: 'Layout/Header',
  component: Header,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Header>;

const stackMeta = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Stack>;

const gridMeta = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Grid>;

export default containerMeta;
type ContainerStory = StoryObj<typeof containerMeta>;
type SidebarStory = StoryObj<typeof sidebarMeta>;
type HeaderStory = StoryObj<typeof headerMeta>;
type StackStory = StoryObj<typeof stackMeta>;
type GridStory = StoryObj<typeof gridMeta>;

// Container Stories
export const DefaultContainer: ContainerStory = {
  args: {
    children: <div className="p-4 bg-gray-100 rounded">Container content</div>,
  },
};

export const SmallContainer: ContainerStory = {
  args: {
    size: 'sm',
    children: <div className="p-4 bg-gray-100 rounded">Small container</div>,
  },
};

// Sidebar Stories
export const DefaultSidebar: SidebarStory = {
  args: {
    children: (
      <div className="space-y-4">
        <h3 className="font-semibold">Navigation</h3>
        <nav className="space-y-2">
          <div className="p-2 bg-gray-100 rounded">Dashboard</div>
          <div className="p-2 bg-gray-100 rounded">Templates</div>
          <div className="p-2 bg-gray-100 rounded">Documents</div>
        </nav>
      </div>
    ),
  },
};

// Header Stories
export const DefaultHeader: HeaderStory = {
  args: {
    children: (
      <div className="flex items-center justify-between w-full">
        <h1 className="text-xl font-bold">Application Title</h1>
        <div className="flex space-x-2">
          <button className="px-3 py-1 bg-blue-500 text-white rounded">Profile</button>
          <button className="px-3 py-1 border rounded">Logout</button>
        </div>
      </div>
    ),
  },
};

// Stack Stories
export const VerticalStack: StackStory = {
  args: {
    direction: 'col',
    spacing: 'md',
    children: (
      <>
        <div className="p-4 bg-blue-100 rounded">Item 1</div>
        <div className="p-4 bg-blue-200 rounded">Item 2</div>
        <div className="p-4 bg-blue-300 rounded">Item 3</div>
      </>
    ),
  },
};

export const HorizontalStack: StackStory = {
  args: {
    direction: 'row',
    spacing: 'lg',
    children: (
      <>
        <div className="p-4 bg-green-100 rounded">Item 1</div>
        <div className="p-4 bg-green-200 rounded">Item 2</div>
        <div className="p-4 bg-green-300 rounded">Item 3</div>
      </>
    ),
  },
};

// Grid Stories
export const TwoColumnGrid: GridStory = {
  args: {
    cols: 2,
    spacing: 'md',
    children: (
      <>
        <div className="p-4 bg-purple-100 rounded">Grid Item 1</div>
        <div className="p-4 bg-purple-200 rounded">Grid Item 2</div>
        <div className="p-4 bg-purple-300 rounded">Grid Item 3</div>
        <div className="p-4 bg-purple-400 rounded">Grid Item 4</div>
      </>
    ),
  },
};

export const ThreeColumnGrid: GridStory = {
  args: {
    cols: 3,
    spacing: 'lg',
    children: (
      <>
        <div className="p-4 bg-orange-100 rounded">Grid Item 1</div>
        <div className="p-4 bg-orange-200 rounded">Grid Item 2</div>
        <div className="p-4 bg-orange-300 rounded">Grid Item 3</div>
        <div className="p-4 bg-orange-400 rounded">Grid Item 4</div>
        <div className="p-4 bg-orange-500 rounded">Grid Item 5</div>
        <div className="p-4 bg-orange-600 rounded">Grid Item 6</div>
      </>
    ),
  },
};