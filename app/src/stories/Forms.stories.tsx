import type { Meta, StoryObj } from '@storybook/react';
import { ProfileForm } from '@/components/forms/profile-form';
import { RegistrationForm } from '@/components/forms/registration-form';

const meta = {
  title: 'Forms',
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Registration: Story = {
  render: () => <RegistrationForm />,
  parameters: {
    docs: {
      description: {
        story: 'Форма регистрации нового пользователя с валидацией полей.',
      },
    },
  },
};

export const RegistrationLoading: Story = {
  render: () => <RegistrationForm isLoading={true} />,
  parameters: {
    docs: {
      description: {
        story: 'Форма регистрации в состоянии загрузки.',
      },
    },
  },
};

export const Profile: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ProfileForm 
        initialData={{
          fullName: "Иван Иванов",
          email: "ivan@example.com",
          phone: "+7 (999) 123-45-67",
          timezone: "Europe/Moscow",
          language: "ru",
        }}
      />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Форма редактирования профиля пользователя с возможностью загрузки аватара.',
      },
    },
  },
};

export const ProfileLoading: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ProfileForm isLoading={true} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Форма профиля в состоянии загрузки.',
      },
    },
  },
};

export const ProfileEmpty: Story = {
  render: () => (
    <div className="w-full max-w-2xl">
      <ProfileForm />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Пустая форма профиля для нового пользователя.',
      },
    },
  },
};