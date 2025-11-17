"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { RegistrationForm } from "@/components/forms/registration-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/toast"
import { useAuth } from "@/hooks/use-auth"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleRegister = async (data: {
    companyName: string
    email: string
    password: string
    confirmPassword: string
    acceptTerms: boolean
  }) => {
    setLoading(true)
    try {
      await register(data)
      toast.success("Регистрация выполнена успешно", { 
        description: "Добро пожаловать в DocFactory! Ваш аккаунт создан." 
      })
      router.push("/dashboard")
    } catch (error) {
      toast.error("Ошибка регистрации", { 
        description: error instanceof Error ? error.message : "Не удалось создать аккаунт" 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Регистрация в DocFactory</h1>
        <p className="text-gray-600 mt-2">Создайте аккаунт для управления документами</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>
            Заполните форму ниже для создания нового аккаунта
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegistrationForm onSubmit={handleRegister} isLoading={loading} />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Уже есть аккаунт?{" "}
              <Link 
                href="/login" 
                className="font-medium text-primary hover:underline"
              >
                Войдите
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}