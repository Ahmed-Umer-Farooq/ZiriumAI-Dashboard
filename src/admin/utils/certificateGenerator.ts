import { jsPDF } from "jspdf";
import QRCode from "qrcode";

interface GenerateCertificateParams {
  internName: string;
  role: string;
  startDate: string;
  endDate: string;
  certificateCode: string;
  verificationToken: string;
}

// Helper to escape XML characters to prevent SVG parsing errors and XSS
const escapeXml = (unsafe: string): string => {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<": return "&lt;";
      case ">": return "&gt;";
      case "&": return "&amp;";
      case "'": return "&apos;";
      case "\"": return "&quot;";
      default: return c;
    }
  });
};

// Helper to convert SVG text to a compressed JPEG base64 Data URL
const convertSvgToJpegBase64 = (svgText: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      // A4 aspect ratio is 297/210 = 1.414. Set high resolution for crisp PDF output.
      canvas.width = 1485;
      canvas.height = 1050;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        
        // Fill white background for JPEG rendering (JPEG doesn't support transparency)
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const jpegBase64 = canvas.toDataURL("image/jpeg", 0.92);
        URL.revokeObjectURL(url);
        resolve(jpegBase64);
      } else {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
};

// Helper to crop the signature from public/certificate.jpeg
const cropSignatureFromCertificate = (url: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      
      // Coordinates of the signature in mm (x: 27 to 70, y: 154 to 176)
      const imgWidthMm = 297;
      const imgHeightMm = 210;
      
      const scaleX = img.width / imgWidthMm;
      const scaleY = img.height / imgHeightMm;
      
      const cropX = 42 * scaleX;
      const cropY = 146 * scaleY;
      const cropW = 52 * scaleX;
      const cropH = 25 * scaleY;
      
      canvas.width = cropW;
      canvas.height = cropH;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        resolve(canvas.toDataURL("image/png"));
      } else {
        resolve(null);
      }
    };
    img.onerror = () => {
      resolve(null);
    };
    img.src = url;
  });
};

export async function generateCertificatePdf({
  internName,
  role,
  startDate,
  endDate,
  certificateCode,
  verificationToken,
}: GenerateCertificateParams): Promise<Blob> {
  // 1. Fetch the raw SVG template file and crop the signature from the JPEG in parallel
  const [response, signBase64] = await Promise.all([
    fetch("/certificate_template (5).svg"),
    cropSignatureFromCertificate("/certificate.jpeg"),
  ]);
  if (!response.ok) {
    throw new Error("Failed to load the certificate template SVG file.");
  }
  let svgText = await response.text();

  // 2. Calculate tenure duration in months
  const start = new Date(startDate);
  const end = new Date(endDate);
  let months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  if (months <= 0) months = 1;
  const durationText = `${months} Month${months > 1 ? "s" : ""}`;

  // 3. Keep the role casing exactly as stored in the database
  let displayRole = role;

  // 4. Perform dynamic string replacements on the SVG XML structure
  // Replace Intern Name
  svgText = svgText.replace("Intern Name", escapeXml(internName));
  // Replace Certificate ID
  svgText = svgText.replace("Certificate ID: ZR-000000", `Certificate ID: ${certificateCode}`);

  // Replace the static duration/organization text with a centered, naturally flowing text block
  const originalDurationTextTag = /<text[^>]*>(?:(?!<\/text>)[\s\S])*?id="duration"[\s\S]*?<\/text>/;
  const centeredDurationTextTag = `<text fill="#403f3f" xml:space="preserve" transform="matrix(.7502827 0 0 .7502827 252.08911 379.09693)" font-size="18.36" font-family="Montserrat, Arial, Helvetica, sans-serif" text-anchor="middle"><tspan y="19" x="222.5">OF ${durationText.toUpperCase()} OFFERED BY ZIRIUM AI</tspan></text>`;
  svgText = svgText.replace(originalDurationTextTag, centeredDurationTextTag);

  // Replace internship program with the database role (retaining database casing)
  svgText = svgText.replace("internship program", escapeXml(displayRole));
  // Replace CEO Name placeholder with Muhammad Ehsan
  svgText = svgText.replace("Founder/CEO Name", "Muhammad Ehsan");
  // Hide the Sign Here placeholder in the SVG
  svgText = svgText.replace("Sign Here", "");
  // Hide the printed signature line (image_20) by scaling its width and height to 0
  svgText = svgText.replace('id="image_20" width="150" height="12"', 'id="image_20" width="0" height="0"');

  if (signBase64) {
    // Embed the signature image base64 directly inside the SVG image placeholder at its original template position (y=435) to prevent any layout shift
    svgText = svgText.replace(
      'id="signature-image" x="110" y="435" width="185" height="65" preserveAspectRatio="xMidYMid meet" xlink:href=""',
      `id="signature-image" x="110" y="435" width="185" height="65" preserveAspectRatio="xMidYMid meet" xlink:href="${signBase64}"`
    );
  }

  // 5. Convert the modified SVG to a high-resolution JPEG
  const templateJpeg = await convertSvgToJpegBase64(svgText);

  // 6. Initialize jsPDF landscape A4 document
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth(); // 297
  const height = doc.internal.pageSize.getHeight(); // 210

  // 7. Draw the converted high-res SVG template as the background
  doc.addImage(templateJpeg, "JPEG", 0, 0, width, height, undefined, "FAST");

  // 8. Generate and overlay the verification QR Code in the dotted box
  // VITE_SITE_URL must be set to the dashboard's deployed URL (e.g. https://dashboard.ziriumai.com)
  // Falls back to current hostname — never use VITE_APP_URL (that's the main website, not the dashboard)
  const baseUrl = import.meta.env.VITE_SITE_URL ||
                  (typeof window !== "undefined" ? window.location.origin : "");
  if (!baseUrl) {
    throw new Error(
      "Missing required base URL environment variable ('VITE_SITE_URL' or 'VITE_APP_URL')."
    );
  }
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const verificationUrl = `${normalizedBaseUrl}/verify/${verificationToken}`;
  const qrBase64 = await QRCode.toDataURL(verificationUrl, {
    width: 150,
    margin: 1,
    color: {
      dark: "#0F172A",
      light: "#FFFFFF",
    },
  });

  // Overlay the QR code on top of the dotted box in the background (exactly matching the SVG rect coordinates)
  doc.addImage(qrBase64, "PNG", 135.4, 149.9, 35.3, 35.3);

  // Return PDF as Blob
  return doc.output("blob");
}
