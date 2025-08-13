import {
  Html,
  Head,
  Font,
  Preview,
  Heading,
  Row,
  Section,
  Text,
} from '@react-email/components';

interface VerificationEmailProps {
  username: string;
  otp: string;
}

export default function VerificationEmail({ username, otp }: VerificationEmailProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        <title>Password Change Verification</title>
        <Font
          fontFamily="Roboto"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>

      <Preview>Your password change verification code is: {otp}</Preview>

      <Section style={{ padding: '20px 0' }}>
        <Row>
          <Heading as="h2">Hi {username},</Heading>
        </Row>
        <Row>
          <Text>
            We received a request to change the password for your account. If this was you,
            please use the verification code below to proceed:
          </Text>
        </Row>
        <Row>
          <Text style={{ fontSize: '24px', fontWeight: 'bold', margin: '12px 0' }}>
            {otp}
          </Text>
        </Row>
        <Row>
          <Text>This code is valid for the next 10 minutes.</Text>
        </Row>
        <Row>
          <Text>
            If you didn&apos;t request a password change, you can safely ignore this email or
            contact our support team.
          </Text>
        </Row>
        <Row>
          <Text>– The MyTodo Team</Text>
        </Row>
      </Section>
    </Html>
  );
}
