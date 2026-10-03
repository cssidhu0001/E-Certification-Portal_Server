const puppeteer = require("puppeteer");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

const { formatTitleCase } = require("../utils/formatText");
const { uploadCertificate } = require("../utils/cloudinary");

const generateCertificate = async (candidate, certificateId) => {
  let browser = null;
  let page = null;

  try {
    console.log("======================================");
    console.log("Starting certificate generation...");
    console.log("Candidate:", candidate.name);
    console.log("Certificate Type:", candidate.certificateType);
    console.log("Certificate ID:", certificateId);
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
    // CERTIFICATE TYPE
    // ==================================================

    const certificateType = String(
      candidate.certificateType || ""
    ).trim();

    const isPresentationCertificate =
      certificateType === "Research Paper" ||
      certificateType === "Poster";

    // ==================================================
    // SELECT TEMPLATE
    // ==================================================

    const templateFileName = isPresentationCertificate
      ? "certificate-presentation.png"
      : "certificate.png";

    const templatePath = path.join(
      __dirname,
      "../assets",
      templateFileName
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(
        `${templateFileName} not found at: ${templatePath}`
      );
    }

    console.log(
      "Template selected:",
      templateFileName
    );

    const template = fs
      .readFileSync(templatePath)
      .toString("base64");

    // ==================================================
    // FORMAT TEXT
    // ==================================================

    const formattedName = formatTitleCase(
      candidate.name || ""
    );

    const formattedPresentationTitle =
      formatTitleCase(
        candidate.presentationTitle || ""
      );

    console.log(
      "Formatted Name:",
      formattedName
    );

    if (isPresentationCertificate) {
      console.log(
        "Presentation Title:",
        formattedPresentationTitle
      );
    }

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
    // GENERATED DATE & TIME
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


/* ==================================================
   NORMAL CERTIFICATE
   CANDIDATE NAME
   ================================================== */

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


/* ==================================================
   NORMAL CERTIFICATE TYPE TICKS
   ORGANIZER / RESOURCE PERSON / DELEGATE
   ================================================== */

.certificate-type-tick {

  position: absolute;

  top: 62.4%;

  width: 28px;
  height: 22px;

  display: flex;

  align-items: center;
  justify-content: center;

  font-family: Arial, sans-serif;

  font-size: 24px;

  font-weight: 700;

  line-height: 1;

  color: #102c4c;

  z-index: 10;

  pointer-events: none;

}


/*
   ORGANIZER
*/

.organizer-tick {

  left: 61.9%;

  transform: translateX(-50%);

}


/*
   RESOURCE PERSON
*/

.resource-person-tick {

  left: 69.0%;

  transform: translateX(-50%);

}


/*
   DELEGATE
*/

.delegate-tick {

  left: 81.5%;

  transform: translateX(-50%);

}


/* ==================================================
   PRESENTATION CERTIFICATE
   NAME
   ================================================== */

.presentation-name {

  position: absolute;

  left: 10%;
  top: 60.0%;

  width: 37%;

  height: 4.5%;

  display: flex;

  align-items: center;
  justify-content: center;

  font-family: Georgia, serif;

  font-size: 21px;

  font-weight: bold;

  color: #102c4c;

  text-align: center;

  overflow: hidden;

  white-space: nowrap;

}


/* ==================================================
   PRESENTATION TITLE
   ================================================== */

.presentation-title {

  position: absolute;

  left: 23%;
  top: 63.7%;

  width: 66.5%;

  height: 5.5%;

  display: flex;

  align-items: center;

  justify-content: flex-start;

  font-family: Georgia, serif;

  font-size: 12px;

  font-weight: bold;

  color: #102c4c;

  text-align: left;

  line-height: 1.15;

  overflow: hidden;

  white-space: nowrap;

}


/* ==================================================
   RESEARCH PAPER / POSTER TICK
   ================================================== */

.presentation-type-tick {

  position: absolute;

  top: 66.2%;

  width: 22px;
  height: 22px;

  display: flex;

  align-items: center;
  justify-content: center;

  font-family: Arial, sans-serif;

  font-size: 20px;

  font-weight: 700;

  line-height: 1;

  color: #102c4c;

  z-index: 10;

  pointer-events: none;

}


/*
   RESEARCH PAPER
*/

.research-paper-tick {

  left: 10.7%;

  transform: translateX(-50%);

}


/*
   POSTER
*/

.poster-tick {

  left: 15.7%;

  transform: translateX(-50%);

}


/* ==================================================
   QR CODE
   ================================================== */

.qr-code {

  position: absolute;

  width: 9%;

  height: auto;

  right: 3.5%;

  bottom: 4%;

}


/* ==================================================
   GENERATED DATE & TIME
   ================================================== */

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


/* ==================================================
   CERTIFICATE ID
   ================================================== */

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

  ${
    isPresentationCertificate
      ? `
        <!-- ==========================================
             PRESENTATION CERTIFICATE
             ========================================== -->

        <!-- PRESENTATION NAME -->

        <div class="presentation-name">
          ${escapeHtml(formattedName)}
        </div>


        <!-- PRESENTATION TITLE -->

        <div class="presentation-title">
          ${escapeHtml(formattedPresentationTitle)}
        </div>


        <!-- RESEARCH PAPER TICK -->

        ${
          certificateType === "Research Paper"
            ? `
              <div class="presentation-type-tick research-paper-tick">
                ✓
              </div>
            `
            : ""
        }


        <!-- POSTER TICK -->

        ${
          certificateType === "Poster"
            ? `
              <div class="presentation-type-tick poster-tick">
                ✓
              </div>
            `
            : ""
        }
      `
      : `
        <!-- ==========================================
             NORMAL CERTIFICATE
             ========================================== -->

        <!-- NORMAL CERTIFICATE NAME -->

        <div class="candidate-name">
          ${escapeHtml(formattedName)}
        </div>


        <!-- ORGANIZER TICK -->

        ${
          certificateType === "Organizer"
            ? `
              <div class="certificate-type-tick organizer-tick">
                ✓
              </div>
            `
            : ""
        }


        <!-- RESOURCE PERSON TICK -->

        ${
          certificateType === "Resource Person"
            ? `
              <div class="certificate-type-tick resource-person-tick">
                ✓
              </div>
            `
            : ""
        }


        <!-- DELEGATE TICK -->

        ${
          certificateType === "Delegate"
            ? `
              <div class="certificate-type-tick delegate-tick">
                ✓
              </div>
            `
            : ""
        }
      `
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

      headless: "shell",

      protocolTimeout: 180000,

      timeout: 120000,

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

      if (document.fonts) {
        await document.fonts.ready;
      }

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
    // UPLOAD TO CLOUDINARY
    // ==================================================

    console.log(
      "Uploading generated PDF to Cloudinary..."
    );

    const cloudinaryUrl =
      await uploadCertificate(
        filePath,
        fileName
      );

    console.log(
      "Cloudinary upload completed successfully"
    );

    console.log(
      "Cloudinary URL:",
      cloudinaryUrl
    );

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
      "Certificate Type:",
      certificateType
    );

    console.log(
      "Certificate ID:",
      certificateId
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
      "Cloudinary URL:",
      cloudinaryUrl
    );

    console.log(
      "======================================"
    );

    // ==================================================
    // RETURN CLOUDINARY URL
    // ==================================================

    return cloudinaryUrl;

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