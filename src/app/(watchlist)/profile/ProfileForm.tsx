'use client'

import { useState, useTransition, useEffect } from 'react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import {
  Trash2, Check, Loader2, Film, Eye, Heart, ArrowRight,
  ShieldAlert, KeyRound, User, SlidersHorizontal,
  AlertTriangle, Moon, Sun, Monitor,
} from 'lucide-react'
import { toast } from 'sonner'
import { updateProfile, changePassword, deleteAccount } from './actions'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ProfilesProps, Theme } from './types/profile'


/* ── Helpers ────────────────────────────────────────────────────────────── */
function getInitials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').toUpperCase().slice(0, 2) || '?'
}
function formatMemberSince(dateStr: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/* ── Section ────────────────────────────────────────────────────────────── */
function Section({ icon: Icon, title, description, children, danger = false }: {
  icon: React.ElementType; title: string; description: string
  children: React.ReactNode; danger?: boolean
}) {
  return (
    <section className={`rounded-2xl border p-6 space-y-5 ${
      danger ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-xl grid place-items-center shrink-0 ${
          danger ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
        }`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className={`text-sm font-semibold ${danger ? 'text-destructive' : ''}`}>{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}

/* ── Field ──────────────────────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

const inputClass = 'w-full h-10 rounded-xl bg-background border border-border px-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/30 focus:border-accent/50 placeholder:text-muted-foreground/50'

/* ── Delete modal ───────────────────────────────────────────────────────── */
function DeleteAccountModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState('')
  const confirmed = confirmation === 'DELETE'

  function handleOpenChange(val: boolean) {
    if (!val) { setConfirmation(''); setError(null); setIsDeleting(false) }
    onOpenChange(val)
  }

  async function handleDelete() {
    if (!confirmed || isDeleting) return
    setIsDeleting(true); setError(null)
    try {
      const result = await deleteAccount()
      if (result?.error) { setError(result.error); setIsDeleting(false) }
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.')
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Delete account
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <p className="text-sm text-muted-foreground">
            This will permanently delete your account and all watchlist data.{' '}
            <span className="font-medium text-foreground">This cannot be undone.</span>
          </p>
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-1">
            <p className="text-xs font-medium text-destructive">You will lose:</p>
            <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
              <li>Your entire watchlist</li>
              <li>All ratings and favorites</li>
              <li>Your account and profile</li>
            </ul>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="delete-confirm" className="text-xs text-muted-foreground">
              Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm
            </label>
            <input id="delete-confirm" type="text" value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)} placeholder="DELETE" autoComplete="off"
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm font-mono outline-none focus:ring-2 focus:ring-destructive/40 placeholder:text-muted-foreground/40 transition-all" />
          </div>
          {error && (
            <div className="rounded-lg bg-destructive/8 border border-destructive/20 px-3 py-2.5">
              <p className="text-xs text-destructive font-medium">{error}</p>
            </div>
          )}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => handleOpenChange(false)} disabled={isDeleting}
              className="flex-1 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition disabled:opacity-50">
              Cancel
            </button>
            <button type="button" disabled={!confirmed || isDeleting} onClick={handleDelete}
              className="flex-1 h-10 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-1.5">
              {isDeleting
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting…</>
                : <><Trash2 className="h-3.5 w-3.5" /> Yes, delete my account</>}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ── Main ───────────────────────────────────────────────────────────────── */
export default function ProfileForm({ displayName, email, createdAt, stats }: ProfilesProps) {
  const [name, setName] = useState(displayName)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [pwResult, setPwResult] = useState<{ error?: string; success?: boolean } | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSavingProfile(true)
    await updateProfile(new FormData(e.currentTarget))
    setIsSavingProfile(false)
    toast.success('Profile updated.')
  }

  async function handlePasswordChange(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await changePassword(formData)
      setPwResult(result)
      if (result?.success) { toast.success('Password updated.'); (e.target as HTMLFormElement).reset() }
      else if (result?.error) toast.error(result.error)
    })
  }

  const themeOptions: { value: Theme; icon: React.ElementType; label: string }[] = [
    { value: 'light',  icon: Sun,     label: 'Light'  },
    { value: 'dark',   icon: Moon,    label: 'Dark'   },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <div className="space-y-5">

      {/* ── Identity card ── */}
      <section className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="h-24 w-full" style={{
          background: 'linear-gradient(135deg, color-mix(in oklab, #8B5CF6 30%, transparent), color-mix(in oklab, #6D28D9 20%, transparent))',
        }} />
        <div className="px-6 pb-6">
          {/* Avatar + stats */}
          <div className="flex items-end justify-between -mt-10 mb-4">
            <div className="h-20 w-20 rounded-2xl ring-4 ring-card grid place-items-center text-2xl font-bold select-none shadow-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', color: '#fff' }}>
              {getInitials(name)}
            </div>
            <div className="flex items-center gap-5 pb-1">
              {[
                { icon: Film,  value: stats.total,     label: 'titles'    },
                { icon: Eye,   value: stats.watched,   label: 'watched'   },
                { icon: Heart, value: stats.favorites, label: 'favorites' },
              ].map(({ icon: Icon, value, label }) => (
                <div key={label} className="text-center">
                  <p className="text-lg font-semibold tabular-nums leading-none">{value}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-0.5">
                    <Icon className="h-2.5 w-2.5" /> {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Name + email + watchlist link */}
          <div className="flex items-end justify-between">
            <div>
              <p className="font-serif text-xl font-semibold">{name || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{email}</p>
              {createdAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Member since {formatMemberSince(createdAt)}
                </p>
              )}
            </div>
            <Link
              href="/watchlist"
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors shrink-0"
            >
              <Film className="h-3.5 w-3.5" />
              My Watchlist
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Personal info ── */}
      <Section icon={User} title="Personal info" description="Update your display name.">
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Display name">
              <input name="display_name" defaultValue={displayName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name" className={inputClass} />
            </Field>
            <Field label="Email">
              <input type="email" value={email} disabled
                className={`${inputClass} text-muted-foreground cursor-not-allowed opacity-60`} />
            </Field>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={isSavingProfile}
              className="h-9 px-4 rounded-xl bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1.5">
              {isSavingProfile
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving…</>
                : <><Check className="h-3.5 w-3.5" /> Save changes</>}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Change password ── */}
      <Section icon={KeyRound} title="Change password" description="Use a strong, unique password you don't use elsewhere.">
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="New password">
              <input name="password" type="password" placeholder="Min. 6 characters"
                required minLength={6} className={inputClass} />
            </Field>
            <Field label="Confirm password">
              <input name="confirm_password" type="password" placeholder="Repeat new password"
                required minLength={6} className={inputClass} />
            </Field>
          </div>
          {pwResult?.error && (
            <p className="text-xs text-destructive flex items-center gap-1.5">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" /> {pwResult.error}
            </p>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={isPending}
              className="h-9 px-4 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition disabled:opacity-50 flex items-center gap-1.5">
              {isPending
                ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Updating…</>
                : 'Update password'}
            </button>
          </div>
        </form>
      </Section>

      {/* ── Appearance ── */}
      <Section icon={SlidersHorizontal} title="Appearance" description="Choose how Mindcrafted Stream looks for you.">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Theme</p>
          <div className="grid grid-cols-3 gap-2">
            {mounted && themeOptions.map(({ value, icon: Icon, label }) => {
              const active = theme === value
              return (
                <button key={value} type="button"
                  onClick={() => { setTheme(value); toast.success(`Theme set to ${label}.`) }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                    active
                      ? 'border-violet-500 bg-violet-500/10 text-violet-600 dark:text-violet-400'
                      : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}>
                  <Icon className="h-4 w-4" />
                  {label}
                  {active && <span className="text-[10px] font-normal opacity-70">Active</span>}
                </button>
              )
            })}
          </div>
          {mounted && (
            <p className="text-[11px] text-muted-foreground">
              Currently using{' '}
              <span className="font-medium text-foreground capitalize">{resolvedTheme}</span> mode.
              {theme === 'system' && ' Follows your device setting.'}
            </p>
          )}
        </div>
      </Section>

      {/* ── Danger zone ── */}
      <Section icon={ShieldAlert} title="Danger zone"
        description="Permanently delete your account and all watchlist data. This cannot be undone." danger>
        <div className="flex items-center justify-between p-4 rounded-xl border border-destructive/20 bg-background/60">
          <div className="min-w-0">
            <p className="text-sm font-medium">Delete account</p>
            <p className="text-xs text-muted-foreground mt-0.5">All your data will be permanently removed.</p>
          </div>
          <button type="button" onClick={() => setShowDeleteModal(true)}
            className="shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-xl bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition">
            <Trash2 className="h-3.5 w-3.5" /> Delete
          </button>
        </div>
      </Section>

      <DeleteAccountModal open={showDeleteModal} onOpenChange={setShowDeleteModal} />
    </div>
  )
}