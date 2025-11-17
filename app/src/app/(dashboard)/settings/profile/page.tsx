"use client"

import { useState } from "react"
import { ProfileForm } from "@/components/forms/profile-form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"

export default function ProfileSettingsPage() {
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleProfileUpdate = async (data: any) => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Профиль обновлен", { 
        description: "Ваши данные успешно сохранены" 
      })
    } catch (error) {
      toast.error("Ошибка обновления", { 
        description: error instanceof Error ? error.message : "Не удалось сохранить изменения" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (data: any) => {
    setLoading(true)
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      toast.success("Пароль изменен", { 
        description: "Ваш пароль успешно обновлен" 
      })
    } catch (error) {
      toast.error("Ошибка изменения пароля", { 
        description: error instanceof Error ? error.message : "Не удалось изменить пароль" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Профиль</h1>
        <p className="text-gray-600 mt-2">Управление вашей личной информацией</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Личная информация</CardTitle>
            <CardDescription>
              Обновите ваши персональные данные
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <AvatarImage src="/placeholder-avatar.jpg" alt={user?.email} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.email}</p>
                <p className="text-sm text-gray-500">Роль: {user?.role}</p>
              </div>
            </div>
            
            <ProfileForm onSubmit={handleProfileUpdate} isLoading={loading} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
            <CardDescription>
              Управление паролем и безопасностью аккаунта
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Текущий пароль</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Введите текущий пароль"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Новый пароль</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Введите новый пароль"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Подтвердите пароль</label>
              <input
                type="password"
                className="w-full p-2 border rounded-md"
                placeholder="Повторите новый пароль"
              />
            </div>

            <Button 
              onClick={handlePasswordChange}
              loading={loading}
              className="w-full"
            >
              Изменить пароль
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}