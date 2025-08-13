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
import { formatDateTime, formatTime } from '@/lib/utils'

interface ReservationReminderEmailProps {
  customerName: string
  dateTime: Date
  partySize: number
  tableNumber?: number
  specialRequests?: string
  restaurantPhone: string
  restaurantAddress: string
}

export const ReservationReminderEmail = ({
  customerName,
  dateTime,
  partySize,
  tableNumber,
  specialRequests,
  restaurantPhone,
  restaurantAddress,
}: ReservationReminderEmailProps) => {
  const formattedDate = formatDateTime(dateTime)
  const formattedTime = formatTime(dateTime)
  const isToday = new Date().toDateString() === dateTime.toDateString()

  return (
    <Html>
      <Head />
      <Preview>
        {isToday ? 'Ihre Reservierung heute' : 'Erinnerung an Ihre Reservierung'} bei Badezeit Sylt
      </Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://badezeit-sylt.de/logo.png"
              width="120"
              height="40"
              alt="Badezeit Sylt"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>
              {isToday ? '🌊 Heute ist es soweit!' : '📅 Erinnerung an Ihre Reservierung'}
            </Heading>
            
            <Text style={text}>
              Liebe/r {customerName},
            </Text>
            
            <Text style={text}>
              {isToday 
                ? 'wir freuen uns, Sie heute bei uns im Badezeit Sylt begrüßen zu dürfen!'
                : 'wir möchten Sie an Ihre bevorstehende Reservierung bei uns erinnern.'
              }
            </Text>

            {/* Reservation Details Box */}
            <Section style={reminderBox}>
              <Heading as="h2" style={h2}>Ihre Reservierung</Heading>
              
              <Row>
                <Column>
                  <Text style={detailLabel}>Datum & Uhrzeit:</Text>
                  <Text style={detailValueLarge}>
                    {isToday ? 'HEUTE' : formattedDate}<br/>
                    <strong>{formattedTime}</strong>
                  </Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={detailLabel}>Personen:</Text>
                  <Text style={detailValue}>{partySize} Person{partySize > 1 ? 'en' : ''}</Text>
                </Column>
                {tableNumber && (
                  <Column>
                    <Text style={detailLabel}>Tisch:</Text>
                    <Text style={detailValue}>Nr. {tableNumber}</Text>
                  </Column>
                )}
              </Row>
              
              {specialRequests && (
                <Row>
                  <Column>
                    <Text style={detailLabel}>Ihre Wünsche:</Text>
                    <Text style={detailValue}>{specialRequests}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Quick Actions */}
            <Section style={actionBox}>
              <Row>
                <Column>
                  <Button
                    style={{...primaryButton, padding: '12px 16px'}}
                    href={`tel:${restaurantPhone.replace(/\s/g, '')}`}
                  >
                    📞 Anrufen
                  </Button>
                </Column>
                <Column>
                  <Button
                    style={{...secondaryButton, padding: '12px 16px'}}
                    href="https://maps.google.com/?q=Badezeit+Sylt+Kampen"
                  >
                    🗺️ Navigation
                  </Button>
                </Column>
              </Row>
            </Section>

            {/* Important Information */}
            <Section style={infoBox}>
              <Heading as="h3" style={h3}>💡 Wichtige Hinweise</Heading>
              <Text style={text}>
                <strong>Anreise:</strong><br/>
                {restaurantAddress}<br/><br/>
                
                <strong>Parken:</strong><br/>
                Kostenlose Parkplätze direkt am Restaurant verfügbar<br/><br/>
                
                <strong>Bei Verspätung:</strong><br/>
                Bitte informieren Sie uns bei Verspätungen über 15 Minuten unter {restaurantPhone}
              </Text>
            </Section>

            {/* Weather Info (placeholder for dynamic weather data) */}
            <Section style={weatherBox}>
              <Heading as="h3" style={h3}>🌤️ Wetter auf Sylt</Heading>
              <Text style={text}>
                Vergessen Sie nicht, wettergerechte Kleidung mitzubringen. 
                Unsere Terrasse mit Meerblick ist bei jedem Wetter ein Erlebnis!
              </Text>
            </Section>

            {/* Menu Highlight */}
            <Section style={menuBox}>
              <Heading as="h3" style={h3}>👨‍🍳 Heute empfiehlt unser Küchenchef</Heading>
              <Text style={text}>
                • Frischer Nordseefisch des Tages<br/>
                • Sylter Kartoffelsuppe mit geräuchertem Aal<br/>
                • Lammrücken mit Rosmarinjus und Gemüse der Saison
              </Text>
              
              <Button
                style={{...menuButton, padding: '12px 20px'}}
                href="https://badezeit-sylt.de/speisekarte"
              >
                Vollständige Speisekarte ansehen
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Wir freuen uns auf Ihren Besuch und ein unvergessliches kulinarisches Erlebnis!<br/>
              Ihr Team vom Badezeit Sylt
            </Text>
            
            <Text style={footerText}>
              <strong>Badezeit Sylt</strong><br/>
              {restaurantAddress}<br/>
              Telefon: {restaurantPhone}<br/>
              <a href="https://badezeit-sylt.de" style={link}>www.badezeit-sylt.de</a>
            </Text>

            <Text style={footerSmall}>
              Falls Sie Ihre Reservierung ändern oder stornieren möchten, 
              kontaktieren Sie uns bitte telefonisch.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const main = {
  backgroundColor: '#f0f8ff',
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
  color: '#1e3a8a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#1e40af',
  fontSize: '22px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
}

const h3 = {
  color: '#1e40af',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const reminderBox = {
  backgroundColor: '#dbeafe',
  border: '3px solid #2563eb',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const infoBox = {
  backgroundColor: '#f0fdf4',
  border: '1px solid #22c55e',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const weatherBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const menuBox = {
  backgroundColor: '#fdf2f8',
  border: '1px solid #ec4899',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const actionBox = {
  margin: '24px 0',
  textAlign: 'center' as const,
}

const detailLabel = {
  color: '#1e40af',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const detailValue = {
  color: '#1e3a8a',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0 0 16px',
}

const detailValueLarge = {
  color: '#1e3a8a',
  fontSize: '20px',
  fontWeight: '700',
  margin: '0 0 16px',
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
  margin: '4px',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #2563eb',
  borderRadius: '6px',
  color: '#2563eb',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '4px',
}

const menuButton = {
  backgroundColor: '#ec4899',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '16px 0 0',
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
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0 0 16px',
}

const footerSmall = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '16px',
  margin: '16px 0 0',
}

const link = {
  color: '#2563eb',
  textDecoration: 'none',
}