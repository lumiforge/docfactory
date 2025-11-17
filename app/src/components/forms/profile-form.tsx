"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Upload } from "lucide-react";
import Image from "next/image";
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
import { cn } from "@/lib/utils";
import { profileSchema, type ProfileFormData } from "@/schemas/auth.schema";

interface ProfileFormProps {
  onSubmit?: (data: ProfileFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<ProfileFormData>;
}

export function ProfileForm({ onSubmit, isLoading = false, initialData }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      timezone: initialData?.timezone || "Europe/Moscow",
      language: initialData?.language || "ru",
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Set form value
      form.setValue("avatar", file);
    }
  };

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      setIsSubmitting(true);
      
      if (onSubmit) {
        await onSubmit(data);
      } else {
        // Mock submission for demo
        toast.loading("Сохранение профиля...");
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        toast.success("Профиль обновлен", "Изменения успешно сохранены");
      }
    } catch (error) {
      toast.error(
        "Ошибка сохранения", 
        error instanceof Error ? error.message : "Попробуйте еще раз"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar preview"
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Camera className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <label
              htmlFor="avatar-upload"
              className="absolute bottom-0 right-0 bg-primary text-white rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isSubmitting || isLoading}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-medium">Фото профиля</h3>
            <p className="text-sm text-gray-500">
              JPG, PNG или WebP. Максимальный размер 5MB
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fullName"
          >
            {({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Полное имя</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Введите ваше имя"
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
        </div>

        <FormField
          control={form.control}
          name="phone"
        >
          {({ field, fieldState }) => (
            <FormItem>
              <FormLabel>Телефон</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="+7 (999) 123-45-67"
                  {...field}
                  disabled={isSubmitting || isLoading}
                  variant={fieldState.error ? "error" : "default"}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="timezone"
          >
            {({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Часовой пояс</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isSubmitting || isLoading}
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                      fieldState.error ? "border-red-500" : "border-gray-200"
                    )}
                  >
                    <option value="Europe/Moscow">Москва (UTC+3)</option>
                    <option value="Europe/London">Лондон (UTC+0)</option>
                    <option value="Europe/Berlin">Берлин (UTC+1)</option>
                    <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                    <option value="America/Los_Angeles">Лос-Анджелес (UTC-8)</option>
                    <option value="Asia/Tokyo">Токио (UTC+9)</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </FormField>

          <FormField
            control={form.control}
            name="language"
          >
            {({ field, fieldState }) => (
              <FormItem>
                <FormLabel>Язык интерфейса</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isSubmitting || isLoading}
                    className={cn(
                      "flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
                      fieldState.error ? "border-red-500" : "border-gray-200"
                    )}
                  >
                    <option value="ru">Русский</option>
                    <option value="en">English</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          </FormField>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => form.reset()}
            disabled={isSubmitting || isLoading}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            loading={isSubmitting || isLoading}
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </div>
      </form>
    </Form>
  );
}