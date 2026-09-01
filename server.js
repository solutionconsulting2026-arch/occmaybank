import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Serve static assets from public folder
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint to create case
app.post('/api/create-case', async (req, res) => {
  try {
    const {
      category,
      subCategory,
      subSubCategory,
      product,
      customerName,
      accountNumber,
      isExistingCustomer,
      mobileNumber,
      emailId,
      details,
      subject
    } = req.body;

    console.log('Received case creation request for customer:', customerName);

    // 1. Authenticate and get Token
    const authUrl = 'https://presales.businessbywire.com/restapigb8/oauth2/token';
    const authPayload = {
      userName: 'james@crmnext.com',
      password: 'Chief@admin2025'
    };

    console.log('Authenticating with CRM API...');
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error('Authentication failed:', errorText);
      return res.status(authResponse.status).json({
        success: false,
        error: 'Failed to authenticate with CRM API',
        details: errorText
      });
    }

    const authData = await authResponse.json();
    console.log('Auth API response received');
    
    // Extract access token
    const token = authData.access_token || authData.token || (authData.result && authData.result.token) || authData.accessToken;
    
    if (!token) {
      console.error('Auth response did not contain a token:', authData);
      return res.status(500).json({
        success: false,
        error: 'No access token returned from CRM authentication',
        details: authData
      });
    }

    // 2. Submit case to CRM Web API
    const saveObjectUrl = 'https://presales.businessbywire.com/restapigb8/crmWebApi/saveObject';
    
    // Construct ObjectData payload based on specs
    const crmPayload = [
      {
        "ItemId": "0",
        "ItemType": "Case",
        "ProcessMode": "Create",
        "OutputFieldList": [
          "CaseId",
          "ItemId"
        ],
        "ObjectData": {
          "LayoutID": 103132,
          "ProcessID": 10001194,
          "AccountID": 2577,
          "Category": category || "",
          "SubCategory": subCategory || "",
          "SubCategory1": subSubCategory || "",
          "StatusCode": "New Request",
          "Subject": subject || `New Case - ${subCategory || 'General'}`,
          "Product": product || "",
          "Details": details || `Case created online for ${customerName}. Existing: ${isExistingCustomer ? 'Yes' : 'No'}`,
          "Cas_ex2_20": customerName || "",
          "Cas_ex6_120": accountNumber || "",
          "Cas_ex1_9": mobileNumber || "",
          "Cas_ex1_3": emailId || "",
          "XMLField_5729": "Website",
          "Origin": "Mobile Banking/Internet Banking"
        }
      }
    ];

    console.log('Submitting case payload to CRM:', JSON.stringify(crmPayload, null, 2));

    const apiHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    const saveResponse = await fetch(saveObjectUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify(crmPayload)
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      console.error('CRM Case creation request failed:', errorText);
      return res.status(saveResponse.status).json({
        success: false,
        error: 'CRM Case creation request failed',
        details: errorText
      });
    }

    const saveResult = await saveResponse.json();
    console.log('CRM saveObject response:', JSON.stringify(saveResult, null, 2));

    // Try to extract Case ID
    let caseId = null;
    if (Array.isArray(saveResult) && saveResult.length > 0) {
      const firstResult = saveResult[0];
      if (firstResult.IsSuccess === false || (firstResult.Errors && firstResult.Errors.length > 0)) {
        return res.status(400).json({
          success: false,
          error: firstResult.Message || 'CRM returned errors while saving case',
          details: firstResult.Errors || firstResult.Message
        });
      }
      
      const responseData = firstResult.ResponseData;
      if (responseData) {
        caseId = responseData.CaseId || responseData.ItemId;
      }
      if (!caseId) {
        caseId = firstResult.ObjectKey || firstResult.Objectkey || firstResult.objectKey;
      }
      if (!caseId && firstResult.Result && firstResult.Result.CaseId) {
        caseId = Array.isArray(firstResult.Result.CaseId) ? firstResult.Result.CaseId[0] : firstResult.Result.CaseId;
      }
    }

    if (!caseId) {
      console.warn('Could not find CaseId in standard response structure, sending raw response');
      caseId = saveResult[0]?.ResponseData?.CaseId || saveResult[0]?.ItemId || saveResult[0]?.ObjectKey || saveResult[0]?.Result?.CaseId?.[0] || 'N/A';
    }

    return res.status(200).json({
      success: true,
      caseId: caseId,
      rawResponse: saveResult
    });

  } catch (error) {
    console.error('Error processing case creation:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Maybank OCC Backend Proxy Server is running on port ${PORT}`);
  console.log(`Local Access URL: http://localhost:${PORT}`);
});
