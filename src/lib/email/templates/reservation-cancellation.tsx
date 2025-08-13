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
  Img,
  Hr,
} from '@react-email/components'
import { formatDateTime } from '@/lib/utils'

interface ReservationCancellationEmailProps {
  customerName: string
  dateTime: Date
  cancellationReason?: string
  rebookingLink: string
}

export const ReservationCancellationEmail = ({
  customerName,
  dateTime,
  cancellationReason,
  rebookingLink,
}: ReservationCancellationEmailProps) => {
  const formattedDateTime = formatDateTime(dateTime)

  return (
    <Html>
      <Head />
      <Preview>Ihre Reservierung bei Badezeit Sylt wurde storniert</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://badezeit-sylt.de/logo.png"
              width="120"
              height="40"
              alt="Badezeit Sylt"
              style={logo}
            />
          </Section>

          <Section style={content}>
            <Heading style={h1}>Reservierung storniert</Heading>
            
            <Text style={text}>
              Liebe/r {customerName},
            </Text>
            
            <Text style={text}>
              Ihre Reservierung für <strong>{formattedDateTime}</strong> wurde erfolgreich storniert.
            </Text>

            {cancellationReason && (
              <Section style={reasonBox}>
                <Text style={reasonText}>
                  <strong>Grund:</strong> {cancellationReason}
                </Text>
              </Section>
            )}

            <Section style={rebookBox}>
              <Heading as="h2" style={h2}>🌊 Wir freuen uns auf Ihren nächsten Besuch!</Heading>
              <Text style={text}>
                Buchen Sie ganz einfach einen neuen Termin und erleben Sie unsere 
                exquisite Küche mit atemberaubendem Meerblick.
              </Text>
              
              <Button
                style={primaryButton}
                href={rebookingLink}
              >
                Neue Reservierung
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Bei Fragen stehen wir Ihnen gerne zur Verfügung.<br/>
              Ihr Team vom Badezeit Sylt
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
}

const header = {
  padding: '24px 24px 0',
  textAlign: 'center' as const,
}

const logo = {
  margin: '0 auto',
}

const content = {
  padding: '24px',
}

const h1 = {
  color: '#dc2626',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#2563eb',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const reasonBox = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '16px',
  margin: '24px 0',
}

const reasonText = {
  color: '#7f1d1d',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0',
}

const rebookBox = {
  backgroundColor: '#f0f9ff',
  border: '2px solid #3b82f6',
  borderRadius: '12px',
  padding: '24px',
  margin: '32px 0',
  textAlign: 'center' as const,
}

const primaryButton = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 24px',
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
  color: '#718096',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 12px',
}