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

interface ReservationConfirmationEmailProps {
  customerName: string
  dateTime: Date
  partySize: number
  tableNumber?: number
  specialRequests?: string
  restaurantPhone: string
  restaurantEmail: string
}

export const ReservationConfirmationEmail = ({
  customerName,
  dateTime,
  partySize,
  tableNumber,
  specialRequests,
  restaurantPhone,
  restaurantEmail,
}: ReservationConfirmationEmailProps) => {
  const formattedDate = formatDateTime(dateTime)
  const formattedTime = formatTime(dateTime)

  return (
    <Html>
      <Head />
      <Preview>Ihre Reservierung bei Badezeit Sylt wurde bestätigt</Preview>
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
            <Heading style={h1}>Reservierung bestätigt!</Heading>
            
            <Text style={text}>
              Liebe/r {customerName},
            </Text>
            
            <Text style={text}>
              vielen Dank für Ihre Reservierung bei Badezeit Sylt. Wir freuen uns, Sie bei uns begrüßen zu dürfen!
            </Text>

            {/* Reservation Details Box */}
            <Section style={reservationBox}>
              <Heading as="h2" style={h2}>Ihre Reservierungsdetails</Heading>
              
              <Row>
                <Column>
                  <Text style={detailLabel}>Datum & Uhrzeit:</Text>
                  <Text style={detailValue}>{formattedDate} um {formattedTime}</Text>
                </Column>
              </Row>
              
              <Row>
                <Column>
                  <Text style={detailLabel}>Anzahl Personen:</Text>
                  <Text style={detailValue}>{partySize} Person{partySize > 1 ? 'en' : ''}</Text>
                </Column>
              </Row>
              
              {tableNumber && (
                <Row>
                  <Column>
                    <Text style={detailLabel}>Tisch:</Text>
                    <Text style={detailValue}>Tisch Nr. {tableNumber}</Text>
                  </Column>
                </Row>
              )}
              
              {specialRequests && (
                <Row>
                  <Column>
                    <Text style={detailLabel}>Besondere Wünsche:</Text>
                    <Text style={detailValue}>{specialRequests}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Important Information */}
            <Section style={infoBox}>
              <Heading as="h3" style={h3}>Wichtige Hinweise</Heading>
              <Text style={text}>
                • Bitte erscheinen Sie pünktlich zu Ihrer Reservierung<br/>
                • Bei Verspätungen über 15 Minuten können wir Ihren Tisch nicht garantieren<br/>
                • Sollten Sie Ihre Pläne ändern müssen, informieren Sie uns bitte mindestens 2 Stunden im Voraus
              </Text>
            </Section>

            {/* Contact Information */}
            <Section style={contactBox}>
              <Heading as="h3" style={h3}>Kontakt</Heading>
              <Text style={text}>
                <strong>Badezeit Sylt</strong><br/>
                Strandweg 1, 25999 Kampen/Sylt<br/>
                Telefon: {restaurantPhone}<br/>
                E-Mail: {restaurantEmail}
              </Text>
            </Section>

            {/* Action Buttons */}
            <Section style={buttonContainer}>
              <Button
                style={primaryButton}
                href="https://badezeit-sylt.de/anfahrt"
              >
                Anfahrt & Parken
              </Button>
              
              <Button
                style={secondaryButton}
                href="https://badezeit-sylt.de/speisekarte"
              >
                Unsere Speisekarte
              </Button>
            </Section>
          </Section>

          <Hr style={hr} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Wir freuen uns auf Ihren Besuch!<br/>
              Ihr Team vom Badezeit Sylt
            </Text>
            
            <Text style={footerText}>
              <a href="https://badezeit-sylt.de" style={link}>www.badezeit-sylt.de</a> | 
              <a href="https://instagram.com/badezeit.sylt" style={link}>@badezeit.sylt</a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
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
  color: '#1a365d',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#2d4a66',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
}

const h3 = {
  color: '#2d4a66',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '24px',
  margin: '0 0 12px',
}

const text = {
  color: '#4a5568',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const reservationBox = {
  backgroundColor: '#f7fafc',
  border: '2px solid #3182ce',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
}

const infoBox = {
  backgroundColor: '#fffaf0',
  border: '1px solid #f6ad55',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const contactBox = {
  backgroundColor: '#f0fff4',
  border: '1px solid #68d391',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const detailLabel = {
  color: '#2d4a66',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px',
}

const detailValue = {
  color: '#1a365d',
  fontSize: '16px',
  fontWeight: '400',
  margin: '0 0 16px',
}

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
}

const primaryButton = {
  backgroundColor: '#3182ce',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '0 8px 8px',
  padding: '12px 20px',
}

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #3182ce',
  borderRadius: '6px',
  color: '#3182ce',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '0 8px 8px',
  padding: '12px 20px',
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

const link = {
  color: '#3182ce',
  textDecoration: 'none',
}