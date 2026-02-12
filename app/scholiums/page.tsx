'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  getUserScholiums,
  createScholium,
  joinScholium,
  setCurrentScholium,
  getScholiumDetails,
  renewScholiumAccessId,
} from '@/app/actions/scholium'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { BookOpen, Plus, LogOut, Loader2, Copy, RotateCw, Users } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import type { Scholium } from '@/lib/scholium'

interface ScholiumWithDetails {
  id: number
  name: string
  created_at: string
  accessId?: string
  isHost?: boolean
  memberCount?: number
}

export default function ScholiumsPage() {
  const router = useRouter()
  const [scholiums, setScholiums] = useState<ScholiumWithDetails[]>([])
  const [scholiumDetails, setScholiumDetails] = useState<Record<number, ScholiumWithDetails>>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [joining, setJoining] = useState(false)
  const [newName, setNewName] = useState('')
  const [accessId, setAccessId] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [renewingId, setRenewingId] = useState<number | null>(null)

  useEffect(() => {
    loadScholiums()
  }, [])

  async function loadScholiums() {
    setLoading(true)
    const data = await getUserScholiums()
    setScholiums(data as ScholiumWithDetails[])

    // Load details for each scholium
    for (const task of data) {
      const details = await getScholiumDetails(task.id)
      if (details.success && details.data) {
        const detailsData = details.data
        setScholiumDetails((prev) => ({
          ...prev,
          [task.id]: {
            id: task.id,
            name: task.name,
            created_at: task.created_at,
            accessId: detailsData.accessId,
            isHost: detailsData.isHost,
            memberCount: detailsData.memberCount,
          },
        }))
      }
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return

    setCreating(true)
    setError(null)

    const result = await createScholium(newName)
    if (result.success && result.data) {
      setNewName('')
      await loadScholiums()
      router.push('/dashboard')
    } else {
      setError(result.error || 'Failed to create scholium')
    }
    setCreating(false)
  }

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault()
    if (!accessId.trim()) return

    setJoining(true)
    setError(null)

    const result = await joinScholium(accessId)
    if (result.success && result.data) {
      setAccessId('')
      await loadScholiums()
      router.push('/dashboard')
    } else {
      setError(result.error || 'Failed to join scholium')
    }
    setJoining(false)
  }

  async function handleSelect(scholiumId: number) {
    await setCurrentScholium(scholiumId)
    router.push('/dashboard')
  }

  async function handleCopyAccessId(id: string, taskId: number) {
    await navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleRenewAccessId(scholiumId: number) {
    setRenewingId(scholiumId)
    const result = await renewScholiumAccessId(scholiumId)
    if (result.success) {
      await loadScholiums()
    } else {
      setError(result.error || 'Failed to renew access ID')
    }
    setRenewingId(null)
  }

  async function handleLogout() {
    await signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Scholium</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Scholiums</h1>
          <p className="text-muted-foreground mb-8">Manage your scholiums and invite classmates to join.</p>

          {/* Create and Join Scholium */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Create */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <Plus className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Create New Scholium</CardTitle>
                    <CardDescription>Start a new scholium for your class or group</CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Scholium</DialogTitle>
                  <DialogDescription>Enter a name for your new scholium. You'll be the host and can manage settings.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="scholium-name">Scholium Name</Label>
                    <Input
                      id="scholium-name"
                      placeholder="e.g., CS101 Fall 2024"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Scholium
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Join */}
            <Dialog>
              <DialogTrigger asChild>
                <Card className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <Plus className="h-8 w-8 text-primary mb-2" />
                    <CardTitle>Join Existing Scholium</CardTitle>
                    <CardDescription>Enter the access ID from a friend or classmate</CardDescription>
                  </CardHeader>
                </Card>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Join Scholium</DialogTitle>
                  <DialogDescription>Ask your classmates or friends for their scholium access ID.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleJoin} className="space-y-4">
                  {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">{error}</div>}
                  <div className="space-y-2">
                    <Label htmlFor="access-id">Access ID</Label>
                    <Input
                      id="access-id"
                      placeholder="e.g., aB3cDeF2"
                      value={accessId}
                      onChange={(e) => setAccessId(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={joining}>
                    {joining && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Join Scholium
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Your Scholiums */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4">Your Scholiums</h2>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : scholiums.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No scholiums yet. Create or join one to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {scholiums.map((scholium) => {
                  const details = scholiumDetails[scholium.id]
                  return (
                    <Card key={scholium.id} className="hover:border-primary transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{scholium.name}</CardTitle>
                            <CardDescription>Created {new Date(scholium.created_at).toLocaleDateString()}</CardDescription>
                          </div>
                          <div className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full text-sm">
                            <Users className="h-4 w-4" />
                            <span>{details?.memberCount || 0}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Role Badge */}
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Role:</span>
                          <span
                            className={`text-sm font-semibold px-2 py-1 rounded ${
                              details?.isHost
                                ? 'bg-primary/10 text-primary'
                                : 'bg-secondary text-secondary-foreground'
                            }`}
                          >
                            {details?.isHost ? 'Host' : 'Member'}
                          </span>
                        </div>

                        {/* Access ID Display */}
                        {details?.accessId && (
                          <div className="space-y-2">
                            <label className="text-sm font-semibold text-foreground">Access ID</label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 bg-secondary px-3 py-2 rounded text-sm font-mono">
                                {details.accessId}
                              </code>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleCopyAccessId(details.accessId!, scholium.id)}
                                className="bg-transparent"
                              >
                                <Copy className="h-4 w-4" />
                                {copiedId === details.accessId ? 'Copied!' : 'Copy'}
                              </Button>
                              {details.isHost && (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRenewAccessId(scholium.id)}
                                  disabled={renewingId === scholium.id}
                                  className="bg-transparent"
                                >
                                  {renewingId === scholium.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCw className="h-4 w-4" />
                                  )}
                                  Renew
                                </Button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Select Button */}
                        <Button onClick={() => handleSelect(scholium.id)} className="w-full">
                          Enter Scholium
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
