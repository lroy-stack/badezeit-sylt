import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Row,
  Column,
  Img,
  Hr,
} from '@react-email/components'

interface NewsletterWelcomeEmailProps {
  firstName: string
  preferredLanguage?: 'de' | 'en'
}

export const NewsletterWelcomeEmail = ({
  firstName,
  preferredLanguage = 'de',
}: NewsletterWelcomeEmailProps) => {
  const isGerman = preferredLanguage === 'de'

  return (
    <Html>
      <Head />
      <Preview>
        {isGerman 
          ? 'Willkommen beim Badezeit Sylt Newsletter!'
          : 'Welcome to the Badezeit Sylt Newsletter!'
        }
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with Ocean Wave Design */}
          <Section style={header}>
            <Img
              src="https://badezeit-sylt.de/logo.png"
              width="140"
              height="46"
              alt="Badezeit Sylt"
              style={logo}
            />
            <div style={waveDecoration}>🌊</div>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>
              {isGerman ? '🌊 Herzlich Willkommen!' : '🌊 Welcome Aboard!'}
            </Heading>
            
            <Text style={welcomeText}>
              {isGerman 
                ? `Liebe/r ${firstName},`
                : `Dear ${firstName},`
              }
            </Text>
            
            <Text style={text}>
              {isGerman 
                ? 'vielen Dank, dass Sie sich für unseren Newsletter angemeldet haben! Als eines der führenden Restaurants auf Sylt mit atemberaubendem Meerblick freuen wir uns, Sie über unsere neuesten kulinarischen Kreationen und besonderen Veranstaltungen zu informieren.'
                : 'thank you for subscribing to our newsletter! As one of Sylt\'s leading restaurants with breathtaking ocean views, we\'re excited to keep you informed about our latest culinary creations and special events.'
              }
            </Text>

            {/* Benefits Section */}
            <Section style={benefitsBox}>
              <Heading as="h2" style={h2}>
                {isGerman ? '🎁 Ihre Vorteile' : '🎁 Your Benefits'}
              </Heading>
              
              <Row style={benefitRow}>
                <Column style={benefitIcon}>📧</Column>
                <Column>
                  <Text style={benefitText}>
                    {isGerman 
                      ? 'Exklusive Einladungen zu Weinverkostungen und kulinarischen Events'
                      : 'Exclusive invitations to wine tastings and culinary events'
                    }
                  </Text>
                </Column>
              </Row>
              
              <Row style={benefitRow}>
                <Column style={benefitIcon}>🍽️</Column>
                <Column>
                  <Text style={benefitText}>
                    {isGerman 
                      ? 'Erste Informationen über neue Gerichte und Saisonmenüs'
                      : 'First updates on new dishes and seasonal menus'
                    }
                  </Text>
                </Column>
              </Row>
              
              <Row style={benefitRow}>
                <Column style={benefitIcon}>🌅</Column>
                <Column>
                  <Text style={benefitText}>
                    {isGerman 
                      ? 'Spezielle Angebote für Sunset-Dinner und besondere Anlässe'
                      : 'Special offers for sunset dinners and special occasions'
                    }
                  </Text>
                </Column>
              </Row>
              
              <Row style={benefitRow}>
                <Column style={benefitIcon}>🎉</Column>
                <Column>
                  <Text style={benefitText}>
                    {isGerman 
                      ? 'Frühe Reservierungsmöglichkeiten für beliebte Termine'
                      : 'Early reservation access for popular dates'
                    }
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Restaurant Highlights */}
            <Section style={highlightBox}>
              <Heading as="h2" style={h2}>
                {isGerman ? '✨ Was Sie bei uns erwartet' : '✨ What Awaits You'}
              </Heading>
              
              <Text style={text}>
                <strong>
                  {isGerman 
                    ? '🌊 Spektakulärer Meerblick'
                    : '🌊 Spectacular Ocean Views'
                  }
                </strong><br/>
                {isGerman 
                  ? 'Genießen Sie Ihr Dinner mit direktem Blick auf die Nordsee'
                  : 'Enjoy your dinner with direct views of the North Sea'
                }
              </Text>
              
              <Text style={text}>
                <strong>
                  {isGerman 
                    ? '🐟 Frische regionale Küche'
                    : '🐟 Fresh Regional Cuisine'
                  }
                </strong><br/>
                {isGerman 
                  ? 'Täglich frischer Fisch und beste Zutaten von der Insel'
                  : 'Daily fresh fish and the finest ingredients from the island'
                }
              </Text>
              
              <Text style={text}>
                <strong>
                  {isGerman 
                    ? '🍷 Erlesene Weinauswahl'
                    : '🍷 Exquisite Wine Selection'
                  }
                </strong><br/>
                {isGerman 
                  ? 'Über 200 ausgewählte Weine, perfekt abgestimmt auf unsere Küche'
                  : 'Over 200 selected wines, perfectly paired with our cuisine'
                }
              </Text>
            </Section>

            {/* Call to Action */}
            <Section style={ctaBox}>
              <Heading as="h3" style={h3}>
                {isGerman ? '🎯 Bereit für Ihr nächstes Erlebnis?' : '🎯 Ready for Your Next Experience?'}
              </Heading>
              
              <Button
                style={primaryButton}
                href="https://badezeit-sylt.de/reservierung"
              >
                {isGerman ? 'Jetzt Reservieren' : 'Reserve Now'}
              </Button>
              
              <Button
                style={secondaryButton}
                href="https://badezeit-sylt.de/speisekarte"
              >
                {isGerman ? 'Speisekarte Entdecken' : 'Discover Our Menu'}
              </Button>
            </Section>

            {/* Social Media */}
            <Section style={socialBox}>
              <Text style={socialText}>
                {isGerman 
                  ? 'Folgen Sie uns für täglich neue Impressionen:'
                  : 'Follow us for daily impressions:'
                }
              </Text>
              
              <Row>
                <Column style={socialColumn}>
                  <Button
                    style={socialButton}
                    href="https://instagram.com/badezeit.sylt"
                  >
                    📸 Instagram
                  </Button>
                </Column>
                <Column style={socialColumn}>
                  <Button
                    style={socialButton}
                    href="https://facebook.com/badezeit.sylt"
                  >
                    👍 Facebook
                  </Button>
                </Column>
              </Row>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              {isGerman 
                ? 'Wir freuen uns darauf, Sie bald bei uns begrüßen zu dürfen!'
                : 'We look forward to welcoming you soon!'
              }<br/>
              {isGerman 
                ? 'Ihr Team vom Badezeit Sylt'
                : 'Your Badezeit Sylt Team'
              }
            </Text>
            
            <Text style={addressText}>
              <strong>Badezeit Sylt</strong><br/>
              Strandweg 1, 25999 Kampen/Sylt<br/>
              Tel: +49 4651 123456<br/>
              <a href="https://badezeit-sylt.de" style={link}>www.badezeit-sylt.de</a>
            </Text>

            <Text style={unsubscribeText}>
              {isGerman 
                ? 'Sie erhalten diese E-Mail, weil Sie sich für unseren Newsletter angemeldet haben. '
                : 'You receive this email because you subscribed to our newsletter. '
              }
              <a href="{{unsubscribe_url}}" style={link}>
                {isGerman ? 'Abmelden' : 'Unsubscribe'}
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles with Ocean Theme
const main = {
  backgroundColor: '#f0f9ff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
  borderRadius: '12px',
  overflow: 'hidden',
}

const header = {
  background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 50%, #0369a1 100%)',
  padding: '32px 24px',
  textAlign: 'center' as const,
  color: '#ffffff',
}

const logo = {
  margin: '0 auto 16px',
  filter: 'brightness(0) invert(1)',
}

const waveDecoration = {
  fontSize: '24px',
  letterSpacing: '4px',
  opacity: 0.8,
}

const content = {
  padding: '32px 24px',
}

const h1 = {
  color: '#0c4a6e',
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#0369a1',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
}

const h3 = {
  color: '#0369a1',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '26px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const welcomeText = {
  color: '#0c4a6e',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '26px',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const benefitsBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #7dd3fc',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
}

const highlightBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const ctaBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const socialBox = {
  backgroundColor: '#fdf4ff',
  border: '1px solid #d8b4fe',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const benefitRow = {
  marginBottom: '16px',
}

const benefitIcon = {
  width: '40px',
  fontSize: '20px',
  textAlign: 'center' as const,
  verticalAlign: 'top',
}

const benefitText = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0',
}

const primaryButton = {
  backgroundColor: '#0ea5e9',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '8px 4px',
  padding: '16px 24px',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #0ea5e9',
  borderRadius: '8px',
  color: '#0ea5e9',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '8px 4px',
  padding: '16px 24px',
}

const socialButton = {
  backgroundColor: '#8b5cf6',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '8px 16px',
}

const socialText = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0 0 16px',
}

const socialColumn = {
  textAlign: 'center' as const,
}

const hr = {
  border: 'none',
  borderTop: '1px solid #e2e8f0',
  margin: '32px 0',
}

const footer = {
  padding: '0 24px',
  textAlign: 'center' as const,
}

const footerText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '22px',
  margin: '0 0 20px',
}

const addressText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const unsubscribeText = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '18px',
  margin: '20px 0 0',
}

const link = {
  color: '#0ea5e9',
  textDecoration: 'none',
}