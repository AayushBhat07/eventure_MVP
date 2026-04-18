export interface EmailProvider {
  sendOtp(email: string, otp: string, appName: string): Promise<void>;
  sendMagicLink(email: string, magicLink: string, appName: string): Promise<void>;
}

export class ResendProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async sendOtp(email: string, otp: string, appName: string): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || `${appName} <onboarding@resend.dev>`,
        to: [email],
        subject: `Your ${appName} verification code`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verification Code</h2>
            <p>Your verification code for ${appName} is:</p>
            <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${otp}
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = (errorBody as any)?.message || response.statusText;
      throw new Error(`Failed to send OTP: ${errorMsg}`);
    }
  }

  async sendMagicLink(email: string, magicLink: string, appName: string): Promise<void> {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || `${appName} <onboarding@resend.dev>`,
        to: [email],
        subject: `Sign in to ${appName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Sign in to ${appName}</h2>
            <p>Click the button below to sign in to your account:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${magicLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Sign In
              </a>
            </div>
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
              ${magicLink}
            </p>
            <p>This link will expire in 15 minutes.</p>
            <p>If you didn't request this link, please ignore this email.</p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const errorMsg = (errorBody as any)?.message || response.statusText;
      throw new Error(`Failed to send magic link: ${errorMsg}`);
    }
  }
}

export class VlyEmailProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  private async sendVlyEmail(payload: {
    to: string[];
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    const keyPreview = this.apiKey ? `${this.apiKey.substring(0, 6)}...${this.apiKey.substring(this.apiKey.length - 4)}` : "MISSING";
    console.log(`[VlyEmail] Sending to ${payload.to.join(",")} | key: ${keyPreview} | endpoint: https://integrations.vly.ai/v1/email/send`);

    const response = await fetch("https://integrations.vly.ai/v1/email/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        "X-Vly-Version": "0.1.0",
      },
      body: JSON.stringify({
        to: payload.to,
        from: "noreply@project.vly.sh",
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = responseData?.error || `Request failed with status ${response.status}: ${response.statusText}`;
      console.error("[VlyEmail] API error:", { status: response.status, statusText: response.statusText, body: JSON.stringify(responseData), keyPreview });
      throw new Error(errorMsg);
    }

    console.log("[VlyEmail] Email sent successfully:", { id: responseData?.id, status: responseData?.status });
  }
  
  async sendOtp(email: string, otp: string, appName: string): Promise<void> {
    await this.sendVlyEmail({
      to: [email],
      subject: `Your ${appName} verification code`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verification Code</h2>
          <p>Your verification code for ${appName} is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
        </div>
      `,
      text: `Your ${appName} verification code is: ${otp}. This code will expire in 15 minutes.`,
    });
  }

  async sendMagicLink(email: string, magicLink: string, appName: string): Promise<void> {
    await this.sendVlyEmail({
      to: [email],
      subject: `Sign in to ${appName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Sign in to ${appName}</h2>
          <p>Click the button below to sign in to your account:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${magicLink}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Sign In
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f5f5f5; padding: 10px; border-radius: 4px;">
            ${magicLink}
          </p>
          <p>This link will expire in 15 minutes.</p>
          <p>If you didn't request this link, please ignore this email.</p>
        </div>
      `,
      text: `Sign in to ${appName}: ${magicLink}. This link will expire in 15 minutes.`,
    });
  }
}

// Factory function to create email provider based on environment
export function createEmailProvider(): EmailProvider {
  // Always prefer VLY email provider first
  const vlyApiKey = process.env.VLY_API_KEY || process.env.VLY_INTEGRATION_KEY;
  if (vlyApiKey) {
    return new VlyEmailProvider(vlyApiKey);
  }

  // Only use Resend if explicitly configured with a custom domain (not the test domain)
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey) {
    return new ResendProvider(resendApiKey);
  }

  throw new Error("No email provider configured. Set VLY_INTEGRATION_KEY or RESEND_API_KEY.");
}