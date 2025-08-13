'use client'

import { useState, useActionState } from 'react'
import Head from 'next/head'
import { PublicLayout } from '@/components/layout/public-layout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { sendContactForm } from '@/app/actions/contact'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Car, 
  Train,
  Navigation,
  Globe,
  Send,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

export default function KontaktPage() {
  const [language, setLanguage] = useState<'de' | 'en'>('de')
  const [state, formAction, pending] = useActionState(sendContactForm, { 
    message: '',
    errors: {}
  })

  const content = {
    de: {
      title: "Kontakt & Anfahrt",
      subtitle: "Besuchen Sie uns für unvergessliche kulinarische Erlebnisse mit Meerblick auf Sylt",
      badge: "📍 Direkt am Strand",
      contactTitle: "Kontaktinformationen",
      openingHours: "Öffnungszeiten",
      directions: "Anfahrt & Parken",
      contactForm: "Nachricht senden"
    },
    en: {
      title: "Contact & Directions",
      subtitle: "Visit us for unforgettable culinary experiences with sea views on Sylt",
      badge: "📍 Directly by the beach",
      contactTitle: "Contact Information",
      openingHours: "Opening Hours",
      directions: "Directions & Parking",
      contactForm: "Send Message"
    }
  }

  const kontaktInfo = {
    address: {
      name: "Strandrestaurant Badezeit",
      street: "Dünenstraße 3",
      city: "25980 Westerland/Sylt",
      country: "Deutschland"
    },
    contact: {
      phone: "+49 (0) 4651 834020",
      email: "info@badezeit.de",
      website: "www.badezeit.de"
    },
    hours: {
      regular: language === 'de' ? "Mo-So: 11:00 - 22:00 Uhr" : "Mon-Sun: 11:00 AM - 10:00 PM",
      kitchen: language === 'de' ? "Küche bis 21:30 Uhr" : "Kitchen until 9:30 PM",
      note: language === 'de' ? "Reservierung empfohlen" : "Reservation recommended"
    }
  }

  return (
    <>
      <Head>
        <title>Kontakt - Badezeit Sylt | Reservierung & Anfahrt</title>
        <meta name="description" content="Kontaktieren Sie Badezeit Sylt für Reservierungen. Strandpromenade 1, Westerland. Tel: +49 4651 834020. Täglich 11-22 Uhr." />
        <meta name="keywords" content="Badezeit Sylt Kontakt, Restaurant Reservierung Sylt, Westerland Restaurant, Sylt Gastronomie" />
        <meta property="og:title" content="Kontakt - Badezeit Sylt" />
        <meta property="og:description" content="Besuchen Sie uns für unvergessliche kulinarische Erlebnisse mit Meerblick auf Sylt" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="de_DE" />
      </Head>
      <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 md:py-20 xl:py-24 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <div 
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url(https://ik.imagekit.io/insomnialz/Badezeit-1170x878.avif)'
            }}
          />
        </div>
        
        <div className="relative z-20 container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              {content[language].badge}
            </Badge>
            
            <h1 className="hero-title mb-6">
              {content[language].title}
            </h1>
            
            <p className="body-text text-white/90 max-w-2xl mx-auto mb-8">
              {content[language].subtitle}
            </p>

            {/* Language Toggle */}
            <div className="flex justify-center gap-2">
              <Button 
                variant={language === 'de' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('de')}
                className={language === 'de' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                Deutsch
              </Button>
              <Button 
                variant={language === 'en' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setLanguage('en')}
                className={language === 'en' ? 'bg-white text-primary' : 'border-white text-white bg-white/20 backdrop-blur-sm hover:bg-white hover:text-primary shadow-lg transition-all duration-200'}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">{content[language].contactTitle}</h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Address & Contact */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">
                    {language === 'de' ? 'Adresse' : 'Address'}
                  </h3>
                </div>
                <div className="space-y-3 text-center">
                  <p className="font-semibold text-lg">{kontaktInfo.address.name}</p>
                  <p>{kontaktInfo.address.street}</p>
                  <p>{kontaktInfo.address.city}</p>
                  <p>{kontaktInfo.address.country}</p>
                </div>
                <div className="mt-6 pt-6 border-t space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-primary" />
                    <a href={`tel:${kontaktInfo.contact.phone.replace(/\s/g, '')}`} 
                       className="hover:text-primary transition-colors">
                      {kontaktInfo.contact.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-primary" />
                    <a href={`mailto:${kontaktInfo.contact.email}`} 
                       className="hover:text-primary transition-colors">
                      {kontaktInfo.contact.email}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <span>{kontaktInfo.contact.website}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Opening Hours */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Clock className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">
                    {content[language].openingHours}
                  </h3>
                </div>
                <div className="space-y-4 text-center">
                  <div>
                    <p className="font-semibold text-lg">{kontaktInfo.hours.regular}</p>
                    <p className="text-sm text-muted-foreground">{kontaktInfo.hours.kitchen}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Badge variant="outline" className="text-primary border-primary">
                      💡 {kontaktInfo.hours.note}
                    </Badge>
                  </div>
                  <div className="pt-4">
                    <Button className="w-full" asChild>
                      <a href="/reservierung">
                        {language === 'de' ? 'Jetzt reservieren' : 'Make Reservation'}
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Directions */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <Navigation className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-4">
                    {content[language].directions}
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Car className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {language === 'de' ? 'Mit dem Auto' : 'By Car'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'de' 
                          ? 'A7 bis Niebüll, dann Autozug nach Sylt. Folgen Sie den Schildern nach Westerland.'
                          : 'A7 to Niebüll, then car train to Sylt. Follow signs to Westerland.'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Train className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">
                        {language === 'de' ? 'Mit der Bahn' : 'By Train'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'de'
                          ? 'Direktverbindung von Hamburg nach Westerland. Bahnhof ist 5 Minuten zu Fuß entfernt.'
                          : 'Direct connection from Hamburg to Westerland. Station is 5 minutes walk away.'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-sm font-semibold">
                      {language === 'de' ? '🅿️ Parken' : '🅿️ Parking'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'de'
                        ? 'Kostenlose Parkplätze direkt am Restaurant verfügbar.'
                        : 'Free parking spaces directly at the restaurant available.'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Google Maps Section - Placeholder for now */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Standort' : 'Location'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'de' 
                ? 'Finden Sie uns direkt an der Strandpromenade von Westerland'
                : 'Find us directly on the beach promenade of Westerland'
              }
            </p>
          </div>
          
          {/* Google Maps Embed */}
          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2286.8834505982143!2d8.318661!3d54.905556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b3f6c0e8b9b2c7%3A0x4a4b9d8e4a7c1234!2sD%C3%BCnenstra%C3%9Fe%203%2C%2025980%20Westerland%20(Sylt)!5e0!3m2!1sde!2sde!4v1699123456789!5m2!1sde!2sde"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={language === 'de' ? 'Strandrestaurant Badezeit Standort' : 'Strandrestaurant Badezeit Location'}
            />
          </div>
          
          {/* Map Actions */}
          <div className="mt-6 flex flex-wrap gap-4 justify-center">
            <Button variant="outline" asChild>
              <a 
                href="https://maps.google.com/maps?q=Dünenstraße+3,+25980+Westerland,+Sylt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Navigation className="h-4 w-4" />
                {language === 'de' ? 'In Google Maps öffnen' : 'Open in Google Maps'}
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a 
                href="https://www.google.com/maps/dir//Dünenstraße+3,+25980+Westerland,+Sylt" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <Car className="h-4 w-4" />
                {language === 'de' ? 'Route planen' : 'Get Directions'}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact Form Section - Placeholder for now */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">{content[language].contactForm}</h2>
              <p className="text-muted-foreground">
                {language === 'de'
                  ? 'Haben Sie Fragen oder möchten Sie uns eine Nachricht senden? Wir freuen uns auf Ihre Kontaktaufnahme.'
                  : 'Do you have questions or would you like to send us a message? We look forward to hearing from you.'
                }
              </p>
            </div>
            
            {/* Contact Form */}
            <Card>
              <CardContent className="p-6">
                {state?.success ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-green-700">
                      {language === 'de' ? 'Nachricht gesendet!' : 'Message sent!'}
                    </h3>
                    <p className="text-muted-foreground mb-6">{state.message}</p>
                    <Button onClick={() => window.location.reload()}>
                      {language === 'de' ? 'Neue Nachricht senden' : 'Send new message'}
                    </Button>
                  </div>
                ) : (
                  <form action={formAction} className="space-y-6">
                    <input type="hidden" name="language" value={language} />
                    
                    {/* Name and Email Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {language === 'de' ? 'Name' : 'Name'} *
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          placeholder={language === 'de' ? 'Ihr vollständiger Name' : 'Your full name'}
                          required
                          className={state?.errors?.name ? 'border-red-500' : ''}
                        />
                        {state?.errors?.name && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {state.errors.name[0]}
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {language === 'de' ? 'E-Mail' : 'Email'} *
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder={language === 'de' ? 'ihre.email@beispiel.de' : 'your.email@example.com'}
                          required
                          className={state?.errors?.email ? 'border-red-500' : ''}
                        />
                        {state?.errors?.email && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {state.errors.email[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Phone and Subject Row */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="telefon">
                          {language === 'de' ? 'Telefon (optional)' : 'Phone (optional)'}
                        </Label>
                        <Input
                          id="telefon"
                          name="telefon"
                          type="tel"
                          placeholder={language === 'de' ? '+49 123 456789' : '+49 123 456789'}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="betreff">
                          {language === 'de' ? 'Betreff' : 'Subject'} *
                        </Label>
                        <Input
                          id="betreff"
                          name="betreff"
                          type="text"
                          placeholder={language === 'de' ? 'Worum geht es?' : 'What is this about?'}
                          required
                          className={state?.errors?.betreff ? 'border-red-500' : ''}
                        />
                        {state?.errors?.betreff && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {state.errors.betreff[0]}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Message */}
                    <div className="space-y-2">
                      <Label htmlFor="nachricht">
                        {language === 'de' ? 'Nachricht' : 'Message'} *
                      </Label>
                      <Textarea
                        id="nachricht"
                        name="nachricht"
                        placeholder={language === 'de' 
                          ? 'Teilen Sie uns mit, wie wir Ihnen helfen können...'
                          : 'Tell us how we can help you...'
                        }
                        rows={5}
                        required
                        className={state?.errors?.nachricht ? 'border-red-500' : ''}
                      />
                      {state?.errors?.nachricht && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertCircle className="h-4 w-4" />
                          {state.errors.nachricht[0]}
                        </p>
                      )}
                    </div>
                    
                    {/* Privacy Policy Checkbox */}
                    <div className="flex items-start space-x-2">
                      <Checkbox 
                        id="datenschutz" 
                        name="datenschutz" 
                        required
                        className={state?.errors?.datenschutz ? 'border-red-500' : ''}
                      />
                      <div className="space-y-1">
                        <Label 
                          htmlFor="datenschutz" 
                          className="text-sm font-normal leading-relaxed cursor-pointer"
                        >
                          {language === 'de' ? (
                            <>
                              Ich stimme der Verarbeitung meiner Daten gemäß der{' '}
                              <a href="/datenschutz" className="text-primary hover:underline">
                                Datenschutzerklärung
                              </a>{' '}
                              zu. *
                            </>
                          ) : (
                            <>
                              I agree to the processing of my data according to the{' '}
                              <a href="/datenschutz" className="text-primary hover:underline">
                                privacy policy
                              </a>
                              . *
                            </>
                          )}
                        </Label>
                        {state?.errors?.datenschutz && (
                          <p className="text-sm text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {language === 'de' 
                              ? 'Sie müssen der Datenschutzerklärung zustimmen'
                              : 'You must accept the privacy policy'
                            }
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* General Error Message */}
                    {state?.message && !state?.success && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700 flex items-center gap-2">
                          <AlertCircle className="h-5 w-5" />
                          {state.message}
                        </p>
                      </div>
                    )}
                    
                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={pending}
                    >
                      {pending ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                          {language === 'de' ? 'Wird gesendet...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          {language === 'de' ? 'Nachricht senden' : 'Send Message'}
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      </PublicLayout>
    </>
  )
}