function doGet(e) {
  var page = (e && e.parameter && e.parameter.page) ? e.parameter.page : '';
  var file = page === 'thank-you' ? 'thank-you' : 'index';
  return HtmlService.createHtmlOutputFromFile(file)
    .setTitle('Employee Registration')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Web App URL for QR generation
function getWebAppUrl() {
  try { return ScriptApp.getService().getUrl(); } catch (e) { return ''; }
}

function processForm(formData) {
  try {
    const spreadsheet = SpreadsheetApp.openById('1oSnhfc88y5eM5Ltk_EJOsxrXPRLwIAYvWBy4XY42KLM');
    let sheet = spreadsheet.getSheetByName('Data');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Data');
      const headers = ['Timestamp', 'Name', 'Gender', 'Email', 'Phone', 'UniqueID'];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setFontWeight('bold'); headerRange.setBackground('#4CAF50'); headerRange.setFontColor('white');
    }
    const lastColumn = sheet.getLastColumn();
    const headers = sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
    if (headers.length === 0 || headers[0] === '') {
      const newHeaders = ['Timestamp', 'Name', 'Gender', 'Email', 'Phone', 'UniqueID'];
      sheet.getRange(1, 1, 1, newHeaders.length).setValues([newHeaders]);
      const headerRange = sheet.getRange(1, 1, 1, newHeaders.length);
      headerRange.setFontWeight('bold'); headerRange.setBackground('#4CAF50'); headerRange.setFontColor('white');
      headers.splice(0, headers.length, ...newHeaders);
    }
    const nextRow = sheet.getLastRow() + 1;
    const rowData = [];
    headers.forEach(header => {
      const matchingKey = Object.keys(formData).find(k => k.toLowerCase() === header.toLowerCase());
      rowData.push(matchingKey ? formData[matchingKey] : '');
    });
    sheet.getRange(nextRow, 1, 1, rowData.length).setValues([rowData]);
    sheet.autoResizeColumns(1, headers.length);
    console.log('Registration successful for:', formData.Name, 'ID:', formData.UniqueID);
    return 'Success';
  } catch (error) {
    console.error('Error processing form:', error);
    throw new Error('Failed to save registration data: ' + error.message);
  }
}

// Optional helpers
function getRegistrationData() {
  try {
    const sheet = SpreadsheetApp.openById('1oSnhfc88y5eM5Ltk_EJOsxrXPRLwIAYvWBy4XY42KLM').getSheetByName('Data');
    if (!sheet) return [];
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    return values.slice(1).map(row => {
      const obj = {};
      headers.forEach((h,i)=>obj[h]=row[i]);
      return obj;
    });
  } catch (e) { console.error(e); return []; }
}

function findRegistrationById(uniqueId) {
  try {
    const sheet = SpreadsheetApp.openById('1oSnhfc88y5eM5Ltk_EJOsxrXPRLwIAYvWBy4XY42KLM').getSheetByName('Data');
    if (!sheet) return null;
    const values = sheet.getDataRange().getValues();
    const headers = values[0];
    const idx = headers.indexOf('UniqueID');
    if (idx === -1) return null;
    for (let i=1;i<values.length;i++){
      if (values[i][idx] === uniqueId) {
        const obj = {};
        headers.forEach((h,j)=>obj[h]=values[i][j]);
        return obj;
      }
    }
    return null;
  } catch (e) { console.error(e); return null; }
}