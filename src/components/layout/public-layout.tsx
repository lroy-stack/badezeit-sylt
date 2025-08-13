import { ReactNode } from 'react'
import { Header } from './header'
import { Footer } from './footer'
import { cn } from '@/lib/utils'

interface PublicLayoutProps {
  children: ReactNode
  headerVariant?: 'default' | 'transparent'
  language?: 'de' | 'en'
  className?: string
  showFooter?: boolean
}

export function PublicLayout({ 
  children, 
  headerVariant = 'default', 
  language = 'de',
  className,
  showFooter = true 
}: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header variant={headerVariant} language={language} />
      
      <main className={cn("flex-1", className)}>
        {children}
      </main>
      
      {showFooter && <Footer language={language} />}
    </div>
  )
}