"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/lib/toast";
import { registrationSchema, type RegistrationFormData } from "@/schemas/auth.schema";

interface RegistrationFormProps {
  onSubmit?: (data: RegistrationFormData) => Promise<void>;
  isLoading?: boolean;
}

export function RegistrationForm({ onSubmit, isLoading = false }: RegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      companyName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const handleSubmit = async (data: RegistrationFormData) => {
    try {
      setIsSubmitting(true);
      
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Mock submission for demo
        toast.loading("Регистрация...");
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success("Регистрация успешна", "Добро пожаловать в систему!");
        form.reset();
      }
    } catch (error) {
      toast.error(
        "Ошибка регистрации", 
        error instanceof Error ? error.message : "Попробуйте еще раз"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="companyName"
        >
          {({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Название компании</FormLabel>
              <FormControl>
                <Input
                  placeholder="Введите название компании"
                  {...field}
                  disabled={isSubmitting || isLoading}
                  variant={fieldState.error ? "error" : "default"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField
          control={form.control}
          name="email"
        >
          {({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  {...field}
                  disabled={isSubmitting || isLoading}
                  variant={fieldState.error ? "error" : "default"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField
          control={form.control}
          name="password"
        >
          {({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Минимум 8 символов"
                  {...field}
                  disabled={isSubmitting || isLoading}
                  variant={fieldState.error ? "error" : "default"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField
          control={form.control}
          name="confirmPassword"
        >
          {({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Подтвердите пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Повторите пароль"
                  {...field}
                  disabled={isSubmitting || isLoading}
                  variant={fieldState.error ? "error" : "default"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <FormField
          control={form.control}
          name="acceptTerms"
        >
          {({ field, fieldState }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting || isLoading}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  Я принимаю{" "}
                  <a
                    href="/terms"
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    условия использования
                  </a>{" "}
                  и{" "}
                  <a
                    href="/privacy"
                    className="text-primary underline hover:text-primary/80"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    политику конфиденциальности
                  </a>
                </FormLabel>
                {fieldState.error && (
                  <FormMessage />
                )}
              </div>
            </FormItem>
          )}
        </FormField>

        <Button
          type="submit"
          className="w-full"
          loading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </Form>
  );
}