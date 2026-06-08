import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(text: string, size: number = 128): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(text, {
      width: size,
      margin: 1,
      color: {
        dark: '#44403C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
}

export async function generateQRCodeCanvas(
  text: string,
  canvas: HTMLCanvasElement,
  size: number = 128
): Promise<void> {
  try {
    await QRCode.toCanvas(canvas, text, {
      width: size,
      margin: 1,
      color: {
        dark: '#44403C',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('Failed to generate QR code on canvas:', error);
    throw error;
  }
}
