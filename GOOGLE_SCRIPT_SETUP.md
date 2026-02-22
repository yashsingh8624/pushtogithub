# Google Apps Script Setup Instructions

## Overview
This document provides the Google Apps Script code needed to handle order submission and retrieval for the ecommerce website.

## Required Google Apps Script Code

Replace the content of your Google Apps Script with the following code:

```javascript
// Replace existing script with this
const SHEET_NAME = 'Orders'; // Change to your sheet name if different

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = JSON.parse(e.postData.contents);

    // Handle order retrieval
    if (data.action === 'getOrders') {
      return getOrdersByPhone(data.phone);
    }

    // Handle order submission (default action)
    const row = [
      data.OrderID,
      data.Date,
      data.CustomerName,
      data.Phone,
      data.Address,
      data.ProductName,
      data.Price,
      data.Quantity,
      data.TotalAmount,
      data.Status
    ];

    sheet.appendRow(row);

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, message: 'Order saved successfully' })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrdersByPhone(phone) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();

    // Skip header row
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      // Assuming phone is in column 4 (index 3)
      if (row[3] && row[3].toString() === phone.toString()) {
        orders.push({
          OrderID: row[0],
          Date: row[1],
          CustomerName: row[2],
          Phone: row[3],
          Address: row[4],
          ProductName: row[5],
          Price: parseFloat(row[6]),
          Quantity: parseInt(row[7]),
          TotalAmount: parseFloat(row[8]),
          Status: row[9] || 'Pending'
        });
      }
    }

    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        orders: orders,
        count: orders.length
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ message: 'Google Apps Script is running' })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

## Setup Steps

1. **Create Google Sheet** (if not already created)
   - Create a new Google Sheet
   - Name the first sheet "Orders"

2. **Set up Sheet Headers**
   - Column A: OrderID
   - Column B: Date
   - Column C: CustomerName
   - Column D: Phone
   - Column E: Address
   - Column F: ProductName
   - Column G: Price
   - Column H: Quantity
   - Column I: TotalAmount
   - Column J: Status

3. **Create Google Apps Script**
   - Go to the Google Sheet
   - Click "Extensions" → "Apps Script"
   - Replace default code with the script above
   - Save the project
   - Click "Deploy" → "New Deployment" → "Type: Web app"
   - Set "Execute as" to your account
   - Set "Who has access" to "Anyone"
   - Copy the deployment URL (it will look like: https://script.google.com/macros/s/AK.../exec)

4. **Update Deployment URL**
   - If the URL in the website code differs, update it in:
     - `src/pages/Checkout.tsx` (ORDER_SHEET_URL constant)
     - `src/pages/Orders.tsx` (GOOGLE_SHEET_URL constant)

## Features

- **Order Submission**: Saves new orders with all details to Google Sheet
- **Order Retrieval**: Search and display orders by phone number
- **Status Tracking**: View order status (Pending, Processing, Completed, Cancelled)

## Notes

- The sheet must have headers in the first row
- Phone numbers are used as the search key for order tracking
- Status can be updated directly in the Google Sheet
- All data is stored in real-time on Google Drive
