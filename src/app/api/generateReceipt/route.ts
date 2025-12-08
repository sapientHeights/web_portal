import { NextRequest } from "next/server";
import puppeteer from "puppeteer";

export async function POST(request: NextRequest) {
    const { date, amount, studentName, amountInWords, classId, paymentMethod, paymentPurpose } = await request.json();
    const purpose = paymentPurpose || 'Tuition Fee';

    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
        ],
    });

    const page = await browser.newPage();

    const html = `
    <html>
        <head>
            <style>
            body {
                font-family: Arial, sans-serif;
                margin: auto;
                padding: 0;
                width: 90%;
                height: 100%;
                box-sizing: border-box;
            }
            .container {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                width: 100%;
                height: 100%;
                padding: 0 10px; 
                page-break-inside: avoid;
            }

            /* Styling for each receipt box */
            .receipt-box {
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                padding: 10px;
                border: 1px solid #000;
                margin-bottom: 0;
                height: 49%; 
                box-sizing: border-box;
            }

            /* Header Section */
            .header {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px solid #000;
                padding: 5px; 
            }
            .header .logo {
                width: 250px; /* Logo width */
                height: auto;
            }
            .header .text {
                text-align: right;
                font-size: 12px;
                margin-left: 10px;
            }
            .header .title {
                font-size: 16px;
                font-weight: bold;
                text-transform: uppercase;
            }
            /* Middle Section */
            .middle {
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #000;
            }
            .middle .text {
                border: 1px solid black;
                border-radius: 10px;
                padding: 5px;
                text-align: center;
                font-weight: bold;
                font-size: 16px;
                width: 20%;
            }

            /* Content Section */
            .content {
                padding: 10px 0;
                font-size: 14px;
                line-height: 1.6;
                text-align: justify;
                margin: 0;
            }
            .content .dynamic {
                font-weight: bold;
                color: #333;
                text-decoration: underline;
            }

            /* Footer Section */
            .footer {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                align-items: center;
                font-size: 12px;
            }
            .footer .amount {
                display: flex;
                align-items: center;
            }
            .footer .amount p {
                border: 1px solid black;
                border-radius: 5px;
                padding: 5px 10px;
                margin-left: 10px;
                font-weight: bold;
                min-width: 60px; 
                text-align: center;
            }
            .footer .signature {
                font-size: 12px;
                text-align: right;
                padding-top: 18px;
            }

            .footer, .content, .middle, .header {
                width: 100%;
                box-sizing: border-box;
            }

            </style>
        </head>
        <body>
            <div class="container">
                <!-- First Receipt (Top Half) -->
                <div class="receipt-box">
                    <div class="header">
                        <img src="https://sapient-portal.vercel.app/sapient-logo.png" class="logo" alt="Logo">
                        <div class="text">
                            <p class="title">Sapient Height International School</p>
                            <p>Address: Near SBI Chowk, MR-4 Road, Vijay Nagar, Jabalpur</p>
                            <p><b>Web:</b> www.sapientheights.net <b>Email:</b> sapientjbp@gmail.com</p>
                            <p><b>Mobile:</b> 7773885566</p>
                        </div>
                    </div>

                    <div class="middle">
                        <p class="text">Receipt</p>
                        <p>Date: <span class="dynamic">${date}</span></p>
                    </div>

                    <div class="content">
                        <p>Received with thank from <span class="dynamic">${studentName}</span> in class <span class="dynamic">${classId}</span> of Rupees <span class="dynamic">${amountInWords} rupees only</span> by <span class="dynamic">${paymentMethod}</span> towards <span class="dynamic">${purpose}</span> of the academic year.</p>
                    </div>

                    <div class="footer">
                        <div class="amount">
                            <p>Rs</p>
                            <p>${amount}</p>
                        </div>
                        <div class="signature">
                            <p>Authorized Signature</p>
                        </div>
                    </div>
                </div>

                <!-- Second Receipt (Bottom Half) -->
                <div class="receipt-box">
                    <div class="header">
                        <img src="https://sapient-portal.vercel.app/sapient-logo.png" class="logo" alt="Logo">
                        <div class="text">
                            <p class="title">Sapient Height International School</p>
                            <p>Address: Near SBI Chowk, MR-4 Road, Vijay Nagar, Jabalpur</p>
                            <p><b>Web:</b> www.sapientheights.net <b>Email:</b> sapientjbp@gmail.com</p>
                            <p><b>Mobile:</b> 7773885566</p>
                        </div>
                    </div>

                    <div class="middle">
                        <p class="text">Receipt</p>
                        <p>Date: <span class="dynamic">${date}</span></p>
                    </div>

                    <div class="content">
                        <p>Received with thank from <span class="dynamic">${studentName}</span> in class <span class="dynamic">${classId}</span> of Rupees <span class="dynamic">${amountInWords} rupees only</span> by <span class="dynamic">${paymentMethod}</span> towards <span class="dynamic">${purpose}</span> of the academic year.</p>
                    </div>

                    <div class="footer">
                        <div class="amount">
                            <p>Rs</p>
                            <p>${amount}</p>
                        </div>
                        <div class="signature">
                            <p>Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    </html>
    `;

    // Set the page content dynamically
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Generate the PDF with updated margins and settings to ensure it fits on one page
    const pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: 20, left: 20, right: 20, bottom: 20 },
        height: '297mm',
        width: '210mm',
    });

    await browser.close();

    // Return the generated PDF in the response
    const arrayBuffer = new Uint8Array(pdfBuffer).buffer;
    return new Response(arrayBuffer, {
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": 'attachment; filename="dynamic_school_pdf.pdf"',
        },
    });
}
