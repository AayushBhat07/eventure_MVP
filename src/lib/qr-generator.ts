import QRCode from "qrcode";

/**
 * Generate a QR code as a base64 PNG data URL.
 */
export async function generateQRCode(data: string): Promise<string> {
  return await QRCode.toDataURL(data, {
    width: 300,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
    errorCorrectionLevel: "M",
  });
}

/**
 * Generate a check-in URL for a given code and event.
 * Uses CONVEX_SITE_URL as the base if available, otherwise a placeholder.
 */
export function generateCheckInURL(code: string, eventId: string): string {
  const baseUrl = process.env.CONVEX_SITE_URL || "https://eventure.app";
  return `${baseUrl}/checkin?code=${encodeURIComponent(code)}&event=${encodeURIComponent(eventId)}`;
}
