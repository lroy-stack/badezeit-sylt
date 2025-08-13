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

interface StaffInvitationEmailProps {
  inviterName: string
  role: string
  invitationLink: string
  restaurantName: string
  expiresIn: string
}

export const StaffInvitationEmail = ({
  inviterName,
  role,
  invitationLink,
  restaurantName,
  expiresIn,
}: StaffInvitationEmailProps) => {
  const getRoleDisplayName = (role: string) => {
    const roleNames: Record<string, string> = {
      ADMIN: 'Administrator',
      MANAGER: 'Manager', 
      STAFF: 'Mitarbeiter',
      KITCHEN: 'Küchen-Team',
    }
    return roleNames[role] || role
  }

  return (
    <Html>
      <Head />
      <Preview>Einladung zum {restaurantName} Team</Preview>
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
            <Heading style={h1}>🎉 Willkommen im Team!</Heading>
            
            <Text style={text}>
              Hallo,
            </Text>
            
            <Text style={text}>
              <strong>{inviterName}</strong> hat Sie eingeladen, dem Team von <strong>{restaurantName}</strong> beizutreten!
            </Text>

            <Section style={invitationBox}>
              <Heading as="h2" style={h2}>Ihre Rolle</Heading>
              <Text style={roleText}>
                {getRoleDisplayName(role)}
              </Text>
              
              <Text style={text}>
                Als {getRoleDisplayName(role)} haben Sie Zugang zu unserem Restaurant-Management-System 
                und können bei der täglichen Organisation und dem Betrieb mitwirken.
              </Text>
            </Section>

            <Section style={ctaBox}>
              <Text style={text}>
                Klicken Sie auf den Button unten, um Ihr Konto einzurichten und loszulegen:
              </Text>
              
              <Button
                style={{...primaryButton, padding: '16px 24px'}}
                href={invitationLink}
              >
                Team beitreten
              </Button>
              
              <Text style={expiryText}>
                ⏰ Diese Einladung läuft in {expiresIn} ab
              </Text>
            </Section>

            <Section style={infoBox}>
              <Heading as="h3" style={h3}>Was Sie erwartet</Heading>
              <Text style={text}>
                • 📊 Zugang zum Restaurant-Dashboard<br/>
                • 📅 Reservierungsverwaltung<br/>
                • 👥 Kundendatenbank<br/>
                • 📋 Tischverwaltung<br/>
                • 📈 Berichte und Analysen
              </Text>
            </Section>
          </Section>

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Wir freuen uns darauf, Sie in unserem Team begrüßen zu dürfen!<br/>
              Das {restaurantName} Team
            </Text>
            
            <Text style={supportText}>
              Bei Fragen zur Einladung wenden Sie sich an: {inviterName}<br/>
              Technischer Support: support@badezeit-sylt.de
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f0fdf4',
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
  color: '#166534',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '36px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}

const h2 = {
  color: '#15803d',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}

const h3 = {
  color: '#15803d',
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

const invitationBox = {
  backgroundColor: '#f0fdf4',
  border: '2px solid #22c55e',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const roleText = {
  backgroundColor: '#dcfce7',
  color: '#166534',
  fontSize: '18px',
  fontWeight: '700',
  padding: '8px 16px',
  borderRadius: '6px',
  display: 'inline-block',
  margin: '0 0 16px',
}

const ctaBox = {
  backgroundColor: '#fef3c7',
  border: '1px solid #f59e0b',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
  textAlign: 'center' as const,
}

const infoBox = {
  backgroundColor: '#f8fafc',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
}

const primaryButton = {
  backgroundColor: '#22c55e',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  margin: '8px 0',
}

const expiryText = {
  color: '#f59e0b',
  fontSize: '14px',
  fontWeight: '600',
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
  fontSize: '16px',
  lineHeight: '22px',
  margin: '0 0 16px',
}

const supportText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '0',
}