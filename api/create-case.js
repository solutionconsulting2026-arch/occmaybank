export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

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
    } = req.body || {};

    // 1. Authenticate with CRM API
    const authUrl = 'https://presales.businessbywire.com/restapigb8/oauth2/token';
    const authPayload = {
      userName: 'james@crmnext.com',
      password: 'Chief@admin2025'
    };

    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(authPayload)
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      return res.status(authResponse.status).json({
        success: false,
        error: 'Failed to authenticate with CRM API',
        details: errorText
      });
    }

    const authData = await authResponse.json();
    const token = authData.access_token || authData.token || (authData.result && authData.result.token) || authData.accessToken;

    if (!token) {
      return res.status(500).json({
        success: false,
        error: 'No access token returned from CRM authentication',
        details: authData
      });
    }

    // 2. Submit case to CRM Web API
    const saveObjectUrl = 'https://presales.businessbywire.com/restapigb8/crmWebApi/saveObject';
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

    const saveResponse = await fetch(saveObjectUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(crmPayload)
    });

    if (!saveResponse.ok) {
      const errorText = await saveResponse.text();
      return res.status(saveResponse.status).json({
        success: false,
        error: 'CRM Case creation request failed',
        details: errorText
      });
    }

    const saveResult = await saveResponse.json();

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
      caseId = saveResult[0]?.ResponseData?.CaseId || saveResult[0]?.ItemId || saveResult[0]?.ObjectKey || saveResult[0]?.Result?.CaseId?.[0] || 'N/A';
    }

    return res.status(200).json({
      success: true,
      caseId: caseId,
      rawResponse: saveResult
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal Server Error'
    });
  }
}
