const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const generateCertificate = async (candidate, certificateId) => {
  let browser = null;
  let page = null;

  try {
    console.log("======================================");
    console.log("Starting certificate generation...");
    console.log("Candidate:", candidate.name);
    console.log("Certificate ID:", certificateId);
    console.log("Certificate Type:", candidate.certificateType);
    console.log("======================================");

    // ==================================================
    // CERTIFICATE DIRECTORY
    // ==================================================

    const certificatesDir = path.join(
      __dirname,
      "../certificates"
    );

    fs.mkdirSync(certificatesDir, {
      recursive: true,
    });

    // ==================================================
    // CERTIFICATE TEMPLATE
    // ==================================================

    const templatePath = path.join(
      __dirname,
      "../assets/certificate.png"
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `certificate.png not found at: ${templatePath}`
      );
    }

    console.log(
      "Template found:",
      templatePath
    );

    const template = fs
      .readFileSync(templatePath)
      .toString("base64");

    // ==================================================
    // VERIFICATION URL
    // ==================================================

    const frontendUrl =
      process.env.FRONTEND_URL ||
      "http://localhost:5173";

    const verifyUrl =
      `${frontendUrl}/verify/${certificateId}`;

    console.log(
      "Verification URL:",
      verifyUrl
    );

    // ==================================================
    // QR CODE
    // ==================================================

    const qrCode = await QRCode.toDataURL(
      verifyUrl,
      {
        errorCorrectionLevel: "H",
        margin: 1,
        width: 300,
      }
    );

    console.log("QR generated");

    // ==================================================
    // CERTIFICATE GENERATED DATE & TIME
    // ==================================================

    const generatedAt = new Date();

    const formattedDateTime =
      generatedAt.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
          timeZone: "Asia/Kolkata",
        }
      );

    console.log(
      "Certificate Generated At:",
      formattedDateTime
    );

    // ==================================================
    // ESCAPE HTML
    // ==================================================

    const escapeHtml = (value = "") => {
      return String(value).replace(
        /[&<>"']/g,
        (char) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[char]
      );
    };

    // ==================================================
    // CERTIFICATE TYPE
    // ==================================================

    const certificateType =
      String(candidate.certificateType || "").trim();

    // ==================================================
    // DYNAMIC TICK
    // ==================================================
    //
    // Current certificate artwork contains:
    //
    // Organizer / Resource Person / Delegate
    //
    // Each option has its own exact position.
    //
    // ==================================================

    const showOrganizerTick =
      certificateType === "Organizer";

    const showResourcePersonTick =
      certificateType === "Resource Person";

    const showDelegateTick =
      certificateType === "Delegate";

    // ==================================================
    // CERTIFICATE HTML
    // ==================================================

    const html = `
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<style>

@page {
  size: 297mm 198mm;
  margin: 0;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;

  width: 297mm;
  height: 198mm;

  overflow: hidden;
}

body {
  background: white;
}

.certificate {

  position: relative;

  width: 297mm;
  height: 198mm;

  background-image:
    url("data:image/png;base64,${template}");

  background-size: 100% 100%;

  background-position: center;

  background-repeat: no-repeat;

}

/* ==============================
   CANDIDATE NAME
   ============================== */

.candidate-name {

  position: absolute;

  left: 10%;
  top: 59.5%;

  width: 38%;
  height: 5%;

  display: flex;

  align-items: center;
  justify-content: center;

  font-family: Georgia, serif;

  font-size: 22px;

  font-weight: bold;

  color: #102c4c;

  text-align: center;

  overflow: hidden;

  white-space: nowrap;

}


/* ==============================
   CERTIFICATE TYPE TICK
   ============================== */

/*
   The certificate artwork already
   contains the text:

   Organizer / Resource Person / Delegate

   So we only overlay the selected
   tick mark.
*/

.certificate-type-tick {

  position: absolute;

  top: 62.0%;

  width: 34px;
  height: 28px;

  display: flex;

  align-items: center;
  justify-content: center;

  font-family: Arial, sans-serif;

  font-size: 30px;

  font-weight: 700;

  line-height: 1;

  color: #102c4c;

  z-index: 10;

  pointer-events: none;

}


/* Organizer */

.organizer-tick {

  left: 61.9%;

  transform: translateX(-50%);

}


/* Resource Person */

.resource-person-tick {

  left: 69.0%;

  transform: translateX(-50%);

}


/* Delegate */

.delegate-tick {

  left: 81.5%;

  transform: translateX(-50%);

}


/* ==============================
   QR CODE
   ============================== */

.qr-code {

  position: absolute;

  width: 9%;

  height: auto;

  right: 3.5%;

  bottom: 4%;

}


/* ==============================
   GENERATED DATE & TIME
   ============================== */

.generated-date {

  position: absolute;

  left: 4%;

  bottom: 2%;

  font-family: Arial, sans-serif;

  font-size: 11px;

  font-weight: 500;

  color: #102c4c;

  white-space: nowrap;

}


/* ==============================
   CERTIFICATE ID
   ============================== */

.certificate-id {

  position: absolute;

  top: 3.2%;

  right: 5%;

  font-family: Arial, sans-serif;

  font-size: 12px;

  font-weight: 700;

  color: #102c4c;

  white-space: nowrap;

}

</style>

</head>

<body>

<div class="certificate">

  <!-- ==========================================
       CANDIDATE NAME
       ========================================== -->

  <div class="candidate-name">
    ${escapeHtml(candidate.name)}
  </div>


  <!-- ==========================================
       DYNAMIC CERTIFICATE TYPE TICK
       ========================================== -->

  ${
    showOrganizerTick
      ? `
        <div
          class="certificate-type-tick organizer-tick"
          aria-label="Organizer selected"
        >
          ✓
        </div>
      `
      : ""
  }


  ${
    showResourcePersonTick
      ? `
        <div
          class="certificate-type-tick resource-person-tick"
          aria-label="Resource Person selected"
        >
          ✓
        </div>
      `
      : ""
  }


  ${
    showDelegateTick
      ? `
        <div
          class="certificate-type-tick delegate-tick"
          aria-label="Delegate selected"
        >
          ✓
        </div>
      `
      : ""
  }


  <!-- ==========================================
       CERTIFICATE ID
       ========================================== -->

  <div class="certificate-id">
    Certificate ID: ${escapeHtml(certificateId)}
  </div>


  <!-- ==========================================
       QR CODE
       ========================================== -->

  <img
    class="qr-code"
    src="${qrCode}"
    alt="Certificate QR Code"
  />


  <!-- ==========================================
       GENERATED DATE & TIME
       ========================================== -->

  <div class="generated-date">
    Generated On: ${escapeHtml(formattedDateTime)}
  </div>

</div>

</body>

</html>
`;

    // ==================================================
    // LAUNCH CHROMIUM
    // ==================================================

    console.log(
      "Launching Chromium..."
    );

    browser = await puppeteer.launch({

      /*
       * IMPORTANT
       *
       * Puppeteer's Chrome Headless Shell
       * use kar rahe hain.
       */

      headless: "shell",

      /*
       * CDP command timeout
       */

      protocolTimeout: 180000,

      /*
       * Browser launch timeout
       */

      timeout: 120000,

      /*
       * Browser output terminal mein
       */

      dumpio: true,

      args: [

        "--no-sandbox",

        "--disable-setuid-sandbox",

        "--disable-dev-shm-usage",

        "--disable-gpu",

        "--disable-software-rasterizer",

        "--disable-extensions",

        "--no-first-run",

        "--no-default-browser-check",

      ],

    });

    console.log(
      "Chromium started successfully"
    );

    // ==================================================
    // BROWSER VERSION
    // ==================================================

    try {

      const version =
        await browser.version();

      console.log(
        "Browser version:",
        version
      );

    } catch (error) {

      console.log(
        "Browser version check failed:",
        error.message
      );

    }

    // ==================================================
    // CREATE PAGE
    // ==================================================

    console.log(
      "Creating new page..."
    );

    page = await browser.newPage();

    console.log(
      "New page created successfully"
    );

    // ==================================================
    // PAGE TIMEOUT
    // ==================================================

    page.setDefaultTimeout(
      120000
    );

    page.setDefaultNavigationTimeout(
      120000
    );

    // ==================================================
    // LOAD HTML
    // ==================================================

    console.log(
      "Loading certificate HTML..."
    );

    await page.setContent(
      html,
      {
        waitUntil: "domcontentloaded",
        timeout: 120000,
      }
    );

    console.log(
      "Certificate HTML loaded"
    );

    // ==================================================
    // WAIT FOR FONTS AND IMAGES
    // ==================================================

    await page.evaluate(async () => {

      // Wait for fonts
      if (document.fonts) {
        await document.fonts.ready;
      }

      // Wait for images
      const images =
        Array.from(document.images);

      await Promise.all(
        images.map((img) => {

          if (img.complete) {
            return Promise.resolve();
          }

          return new Promise((resolve) => {

            img.onload = resolve;

            img.onerror = resolve;

          });

        })
      );

    });

    console.log(
      "Certificate rendering ready"
    );

    // ==================================================
    // PDF FILE
    // ==================================================

    const fileName =
      `${certificateId}.pdf`;

    const filePath =
      path.join(
        certificatesDir,
        fileName
      );

    console.log(
      "PDF path:",
      filePath
    );

    // ==================================================
    // GENERATE PDF
    // ==================================================

    console.log(
      "Generating PDF..."
    );

    await page.pdf({

      path: filePath,

      width: "297mm",

      height: "198mm",

      printBackground: true,

      preferCSSPageSize: true,

      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },

    });

    // ==================================================
    // VERIFY PDF
    // ==================================================

    if (!fs.existsSync(filePath)) {

      throw new Error(
        "PDF generation finished but PDF file was not created."
      );

    }

    const stats =
      fs.statSync(filePath);

    if (stats.size === 0) {

      throw new Error(
        "PDF file was created but its size is 0 bytes."
      );

    }

    // ==================================================
    // SUCCESS
    // ==================================================

    console.log(
      "======================================"
    );

    console.log(
      "CERTIFICATE GENERATED SUCCESSFULLY"
    );

    console.log(
      "Certificate ID:",
      certificateId
    );

    console.log(
      "Certificate Type:",
      certificateType
    );

    console.log(
      "Generated At:",
      formattedDateTime
    );

    console.log(
      "File:",
      fileName
    );

    console.log(
      "Size:",
      stats.size,
      "bytes"
    );

    console.log(
      "======================================"
    );

    return `/certificates/${fileName}`;

  } catch (error) {

    console.error(
      "======================================"
    );

    console.error(
      "CERTIFICATE GENERATION FAILED"
    );

    console.error(
      "Error:",
      error
    );

    console.error(
      "======================================"
    );

    throw error;

  } finally {

    // ==================================================
    // CLOSE PAGE
    // ==================================================

    if (page) {

      try {

        await page.close();

        console.log(
          "Page closed"
        );

      } catch (error) {

        console.log(
          "Page close error:",
          error.message
        );

      }

    }

    // ==================================================
    // CLOSE BROWSER
    // ==================================================

    if (browser) {

      try {

        await browser.close();

        console.log(
          "Browser closed"
        );

      } catch (error) {

        console.log(
          "Browser close error:",
          error.message
        );

      }

    }

  }
};

module.exports = generateCertificate;