"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Loader2, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { slugify } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Store as StoreType } from "@/lib/types"

export default function StoreSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [store, setStore] = useState<StoreType | null>(null)
  const [isNewStore, setIsNewStore] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo_url: "",
    banner_url: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchStore = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: existingStore } = await supabase
        .from("stores")
        .select("*")
        .eq("owner_id", user.id)
        .single()

      if (existingStore) {
        setStore(existingStore)
        setFormData({
          name: existingStore.name,
          slug: existingStore.slug,
          description: existingStore.description || "",
          logo_url: existingStore.logo_url || "",
          banner_url: existingStore.banner_url || "",
        })
      } else {
        setIsNewStore(true)
      }

      setLoading(false)
    }

    fetchStore()
  }, [router])

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: isNewStore ? slugify(name) : formData.slug,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (isNewStore) {
      const { error: insertError } = await supabase.from("stores").insert({
        owner_id: user.id,
        name: formData.name,
        slug: formData.slug,
        description: formData.description || null,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        status: "pending",
      })

      if (insertError) {
        setError(insertError.message)
        setSaving(false)
        return
      }

      router.push("/dashboard")
      router.refresh()
    } else {
      const { error: updateError } = await supabase
        .from("stores")
        .update({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          logo_url: formData.logo_url || null,
          banner_url: formData.banner_url || null,
        })
        .eq("id", store?.id)

      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }

      setSuccess(true)
      router.refresh()
    }

    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">
        {isNewStore ? "Create Your Store" : "Store Settings"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>
              {isNewStore
                ? "Set up your store to start selling"
                : "Update your store details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Store Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Store URL</Label>
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">
                  /stores/
                </span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                placeholder="Tell customers about your store..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
            <CardDescription>Customize how your store looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                value={formData.logo_url}
                onChange={(e) =>
                  setFormData({ ...formData, logo_url: e.target.value })
                }
                placeholder="https://example.com/logo.png"
              />
              {formData.logo_url && (
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center overflow-hidden mt-2 relative">
                  <Image
                    src={formData.logo_url}
                    alt="Logo preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner_url">Banner URL</Label>
              <Input
                id="banner_url"
                type="url"
                value={formData.banner_url}
                onChange={(e) =>
                  setFormData({ ...formData, banner_url: e.target.value })
                }
                placeholder="https://example.com/banner.jpg"
              />
              {formData.banner_url && (
                <div className="h-24 w-full rounded-lg bg-muted overflow-hidden mt-2 relative">
                  <Image
                    src={formData.banner_url}
                    alt="Banner preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 rounded-md">
            Store settings saved successfully!
          </div>
        )}

        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isNewStore ? "Create Store" : "Save Changes"}
        </Button>
      </form>
    </div>
  )
}
