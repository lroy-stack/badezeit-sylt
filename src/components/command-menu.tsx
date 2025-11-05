"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  LayoutDashboard,
  Users,
  Table,
  Menu,
  BarChart3,
  Search,
} from "lucide-react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface CommandMenuProps {
  userRole?: string
}

export function CommandMenu({ userRole }: CommandMenuProps) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = React.useCallback((command: () => unknown) => {
    setOpen(false)
    command()
  }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-9 w-full justify-start rounded-md bg-muted/50 text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Suche...</span>
        <span className="inline-flex lg:hidden">Suche...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Suche nach Befehlen..." />
        <CommandList>
          <CommandEmpty>Keine Ergebnisse gefunden.</CommandEmpty>
          <CommandGroup heading="Navigation">
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/dashboard"))
              }}
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/dashboard/reservierungen"))
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Reservierungen</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/dashboard/kunden"))
              }}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Kunden</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/dashboard/tische"))
              }}
            >
              <Table className="mr-2 h-4 w-4" />
              <span>Tische</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/dashboard/speisekarte"))
              }}
            >
              <Menu className="mr-2 h-4 w-4" />
              <span>Speisekarte</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Schnellzugriff">
            {(userRole === "ADMIN" || userRole === "MANAGER") && (
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push("/dashboard/analytics"))
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>Analytics</span>
              </CommandItem>
            )}
            {userRole === "ADMIN" && (
              <CommandItem
                onSelect={() => {
                  runCommand(() => router.push("/dashboard/einstellungen"))
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Einstellungen</span>
              </CommandItem>
            )}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Öffentliche Seiten">
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/"))
              }}
            >
              <Smile className="mr-2 h-4 w-4" />
              <span>Startseite</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/speisekarte"))
              }}
            >
              <Menu className="mr-2 h-4 w-4" />
              <span>Öffentliche Speisekarte</span>
            </CommandItem>
            <CommandItem
              onSelect={() => {
                runCommand(() => router.push("/reservierung"))
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              <span>Reservierung</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
