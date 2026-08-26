import { NextRequest, NextResponse } from "next/server";
import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sheetId = process.env.GOOGLE_SHEET_ID;
    const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY;

    if (!sheetId || !serviceAccountEmail || !privateKey) {
      console.error("Missing Google Sheets environment variables");
      return NextResponse.json(
        { success: false, error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Format private key (replace literal \n with actual newlines)
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");

    const auth = new JWT({
      email: serviceAccountEmail,
      key: formattedPrivateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const doc = new GoogleSpreadsheet(sheetId, auth);
    await doc.loadInfo(); // Loads document properties and worksheets

    const sheet = doc.sheetsByIndex[0]; // Assuming it's the first tab
    
    // Add row (columns must match the headers in your sheet or you can use an array if order matches exactly)
    await sheet.addRow({
      Name: name,
      Email: email,
      Subject: subject,
      Message: message,
      Date: new Date().toISOString()
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Google Sheets Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit message" },
      { status: 500 }
    );
  }
}
