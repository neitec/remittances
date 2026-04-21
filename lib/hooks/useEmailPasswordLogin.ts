'use client';

export function usePasswordlessOTP() {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;

  const sendOTP = async (email: string) => {
    if (!domain || !clientId) {
      throw new Error('Auth0 configuration missing');
    }

    try {
      const response = await fetch(`https://${domain}/passwordless/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          connection: 'email',
          email: email,
          send: 'code',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Auth0 error:', data);
        throw new Error(data.error_description || 'Error enviando código');
      }

      console.log('OTP sent successfully');
      return { success: true };
    } catch (error) {
      console.error('sendOTP error:', error);
      throw error instanceof Error ? error : new Error('Error al enviar código');
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    if (!domain || !clientId) {
      throw new Error('Auth0 configuration missing');
    }

    try {
      const response = await fetch(`https://${domain}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: clientId,
          connection: 'email',
          username: email,
          otp: otp,
          realm: 'email',
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE,
          scope: 'openid profile email',
          grant_type: 'http://auth0.com/oauth/grant-type/passwordless/otp',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Auth0 verify error:', data);
        throw new Error(data.error_description || 'Código inválido');
      }

      window.location.href = '/dashboard';
    } catch (error) {
      console.error('verifyOTP error:', error);
      throw error instanceof Error ? error : new Error('Error al verificar código');
    }
  };

  return { sendOTP, verifyOTP };
}
