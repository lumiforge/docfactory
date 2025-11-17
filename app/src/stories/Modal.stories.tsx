import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';
import {
  Modal,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from '@/components/ui/modal';

const meta = {
  title: 'UI/Modal',
  component: Modal,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Открыть модальное окно</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Заголовок модального окна</ModalTitle>
          <ModalDescription>
            Это описание модального окна. Здесь можно разместить дополнительную информацию о контексте.
          </ModalDescription>
        </ModalHeader>
        <div className="py-4">
          <p>Содержимое модального окна. Здесь может быть любая информация или форма.</p>
        </div>
        <ModalFooter>
          <Button variant="outline">Отмена</Button>
          <Button>Сохранить</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const WithForm: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Форма входа</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Вход в систему</ModalTitle>
          <ModalDescription>
            Введите ваши учетные данные для доступа к системе
          </ModalDescription>
        </ModalHeader>
        <div className="py-4 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Пароль
            </label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="•••••••••"
            />
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline">Отмена</Button>
          <Button>Войти</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};

export const LargeContent: Story = {
  render: () => (
    <Modal>
      <ModalTrigger asChild>
        <Button>Большое модальное окно</Button>
      </ModalTrigger>
      <ModalContent className="max-w-2xl">
        <ModalHeader>
          <ModalTitle>Детальная информация</ModalTitle>
          <ModalDescription>
            Пример модального окна с большим количеством контента
          </ModalDescription>
        </ModalHeader>
        <div className="py-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Раздел 1</h3>
            <p className="text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Раздел 2</h3>
            <p className="text-gray-600">
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-2">Раздел 3</h3>
            <p className="text-gray-600">
              Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
            </p>
          </div>
        </div>
        <ModalFooter>
          <Button variant="outline">Закрыть</Button>
          <Button>Применить изменения</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  ),
};