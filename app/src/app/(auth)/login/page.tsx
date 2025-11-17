"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { LoginForm } from "@/components/forms/login-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = async (data: { email: string; password: string; rememberMe?: boolean }) => {
    setLoading(true)
    try {
      await login(data.email, data.password)
      toast.success("Вход выполнен успешно", { description: "Добро пожаловать в DocFactory" })
      router.push("/dashboard")
    } catch (error) {
      toast.error("Ошибка входа", { description: error instanceof Error ? error.message : "Неверный email или пароль" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Вход в DocFactory</h1>
        <p className="text-gray-600 mt-2">Введите свои данные для доступа к системе</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Вход</CardTitle>
          <CardDescription>
            Используйте ваш email и пароль для входа в аккаунт
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleLogin} loading={loading} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Нет аккаунта?{" "}
              <Link 
                href="/register" 
                className="font-medium text-primary hover:underline"
              >
                Зарегистрируйтесь
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}