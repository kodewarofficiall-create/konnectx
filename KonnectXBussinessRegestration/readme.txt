Beginner-Friendly Step-by-Step Setup Guide
1. Open Google Sheets & Create a New Spreadsheet
Open your browser and navigate to https://sheets.google.com
.
Click Blank spreadsheet to create a new sheet.
Name your spreadsheet at the top left (e.g., KonnectX Registrations).

2. Open Google Apps Script
In the Google Sheets top menu bar, click on Extensions → Apps Script.
A new browser tab will open with the Apps Script code editor.
Rename the Apps Script project at the top left to KonnectX Backend.

3. Add the Code.gs Code
In the Apps Script code editor, delete any default code inside Code.gs (myFunction() { ... }).
Open Code.gs from your workspace and copy all of its contents.
Paste the contents into the Apps Script editor window.
Click the Save icon (diskette icon) or press Ctrl + S.

4. Initialize the Spreadsheet and Google Drive Folders
At the top toolbar of Apps Script, locate the function dropdown menu (defaults to doPost or setup).
Select setup from the dropdown menu.
Click the Run button (play icon).
Google will prompt you with an "Authorization Required" window:
Click Review permissions.
Select your Google account.
If you see Google hasn't verified this app, click Advanced at the bottom left, then click Go to KonnectX Backend (unsafe).
Click Allow.
Once execution finishes, check the Execution Log at the bottom. You will see:
text
✅ Setup completed successfully!
Sheet Name: Registrations
Spreadsheet URL: ...
Uploads Folder ID: ... | Folder Name: Website Form Uploads
Return to your Google Sheet tab. You will see a newly formatted Registrations tab with styled dark headers.
Open Google Drive
. You will see the newly created folder named Website Form Uploads.
Setup stores the ID of the spreadsheet from which it is run. If you connect the script to a different spreadsheet, run setup again from that spreadsheet and confirm its URL in the execution log before deploying.

5. Deploy Apps Script as a Web App
At the top right of the Apps Script editor, click the blue Deploy button and choose New deployment.
Click the gear icon (Select type) next to "Select type" and select Web app.
Fill in the deployment details:
Description: v1 - Website Registration Form
Execute as: Me (your-email@gmail.com) (Important: This allows submissions to write to your Sheet and Drive without requiring users to log in).
Who has access: Anyone (Important: This allows your public website visitors to submit the form without needing permission).
Click Deploy.

6. Copy the Web App URL & Paste into Index.html
After deployment finishes, copy the URL under Web app URL (it ends in /exec).
Open Index.html in your editor.
Find the SUBMIT_ENDPOINT constant and replace:
javascript
const SUBMIT_ENDPOINT = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE";
with your actual URL:
javascript
const SUBMIT_ENDPOINT = "https://script.google.com/macros/s/YOUR_ACTUAL_SCRIPT_ID/exec";
Save Index.html.

Whenever you change Code.gs, deploy a new version from Deploy → Manage deployments → Edit, select New version, and click Deploy. If you create a new deployment instead, update the URL in Index.html as well.

7. How to Test Form Submission
Double-click Index.html to open it in your browser.
Click the round seal logo to open the envelope.
Fill in the form fields with test data and attach an image (JPG, PNG, or WEBP) or PDF receipt.
Click Submit Registration ↗.
You will see the button state update to Submitting.... The success dialog appears only after the web app confirms the row was written. It also shows the submission ID and provides a link to the exact spreadsheet tab that received the row.

8. How to Verify Uploads in Drive and Sheet
Open your Google Sheet:
A new row will be created with the generated Submission ID, date/time, name, contact details, business information, and a direct Google Drive link under Drive File Link.
Open Google Drive:
Open Website Form Uploads → click the month folder (e.g., 2026-11).
You will see the uploaded receipt named with your submission ID prefix (e.g. SUB-20261104-XXXX_receipt.png).

9. How to Download the Data as an Excel (.xlsx) File
In your Google Sheet, click File in the top menu.
Hover over Download.
Click Microsoft Excel (.xlsx).
The .xlsx spreadsheet containing all submissions and file links will be downloaded directly to your computer.