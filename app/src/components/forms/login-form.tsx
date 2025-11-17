"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema"

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  loading?: boolean
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  const handleSubmit = async (data: LoginFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium leading-none">
          Email
        </label>
        <Input
          {...form.register("email")}
          id="email"
          type="email"
          placeholder="example@company.com"
          variant={form.formState.errors.email ? "error" : "default"}
          disabled={loading}
        />
        {form.formState.errors.email && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium leading-none">
          Пароль
        </label>
        <div className="relative">
          <Input
            {...form.register("password")}
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Введите пароль"
            variant={form.formState.errors.password ? "error" : "default"}
            disabled={loading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {form.formState.errors.password && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <input
          {...form.register("rememberMe")}
          type="checkbox"
          id="rememberMe"
          disabled={loading}
          className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-primary"
        />
        <label htmlFor="rememberMe" className="text-sm font-normal">
          Запомнить меня
        </label>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        loading={loading}
        disabled={loading}
      >
        {loading ? "Вход..." : "Войти"}
      </Button>
    </form>
  )
}