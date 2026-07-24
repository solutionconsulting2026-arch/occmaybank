// Corporate Banking Cascading Dropdowns, Captcha & OTP Handler

const categoryData = {
  "Request": {
    "Account Detail Modification": [
      "Address Update",
      "Email ID Updation",
      "Mobile Number Updation"
    ],
    "Cards": [
      "ATM Transaction Chargeback",
      "Card Activate",
      "Card Block",
      "Card Inactive",
      "Debit Card Activation",
      "Debit Card Limit Modification",
      "Debit Card Temporary Unblocking"
    ],
    "Loans": [
      "eNACH NACH",
      "Loan Account Statement",
      "Loan EMI Cycle Change",
      "Loan Foreclosure Request",
      "Loan Repayment Schedule",
      "Loan Restructure Request",
      "Moratorium Restructuring",
      "Part Payment of Loan",
      "Personal KYC Details Update"
    ],
    "Digital Account": [
      "Mobile App Features",
      "Online Banking Setup",
      "Security Measures"
    ]
  },
  "Query": {
    "Transaction & Balance Enquiry": [],
    "Account Related": [
      "Account Closure",
      "Account Dormancy Removal",
      "Account Information",
      "Account Opening",
      "Account Transfer",
      "Address Modification",
      "Balance Enquiry",
      "Statement Dispatch"
    ],
    "Cards": [
      "Card Benefits",
      "Credit Card Information",
      "Credit Card Transactions",
      "Debit Card PIN not received",
      "Loyalty Points Redemption"
    ],
    "Loan Related": []
  },
  "Complaint": {
    "Loan Closure & Prepayment": [
      "Incorrect Bounce Charges Applied"
    ],
    "Cards": [
      "Card PIN not working",
      "Duplicate Transaction Dispute",
      "Fraud Transaction Dispute",
      "POS Transaction Failure"
    ],
    "Loans": [
      "Foreclosure Letter Not Received",
      "Loan Details Discrepancy",
      "Loan payment not credited"
    ],
    "Savings Account": [
      "Account Blocked",
      "Account Closure Dispute",
      "Address Modification",
      "Cheque Book not received",
      "ECS Returned but balance Sufficient",
      "Employee Behavior",
      "Estatement not received",
      "Interest Calculation Complaint",
      "Service Charges Complaint"
    ]
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const caseForm = document.getElementById("case-form");
  const formWrapper = document.getElementById("form-wrapper");
  const thankYouWrapper = document.getElementById("thank-you-wrapper");
  const loadingSpinner = document.getElementById("loading-spinner");
  const otpModal = document.getElementById("otp-modal");
  
  // Interactive fields
  const isCustomerRadios = document.getElementsByName("isCustomer");
  const accountNumberGroup = document.getElementById("account-number-group");
  const accountNumberInput = document.getElementById("accountNumber");
  
  const productSelect = document.getElementById("product");
  const categorySelect = document.getElementById("category");
  const subCategorySelect = document.getElementById("sub-category");
  const subSubCategorySelect = document.getElementById("sub-sub-category");
  const subSubCategoryGroup = document.getElementById("sub-sub-category-group");
  
  const firstNameInput = document.getElementById("firstName");
  const lastNameInput = document.getElementById("lastName");
  const addressInput = document.getElementById("address");
  const detailsInput = document.getElementById("details");
  const emailIdInput = document.getElementById("emailId");
  const mobileNumberInput = document.getElementById("mobileNumber");
  const countryCodeInput = document.getElementById("countryCode");
  const alternateNoInput = document.getElementById("alternateNo");
  const fileInput = document.getElementById("documentFile");
  const fileNameLabel = document.getElementById("file-name-label");
  
  // Captcha elements
  const captchaCanvas = document.getElementById("captcha-canvas");
  const btnRefreshCaptcha = document.getElementById("btn-refresh-captcha");
  const captchaInput = document.getElementById("captchaInput");
  
  // OTP Elements
  const btnGetOtp = document.getElementById("btn-get-otp");
  const btnVerifyOtp = document.getElementById("btn-verify-otp");
  const btnCancelOtp = document.getElementById("btn-cancel-otp");
  const btnCloseOtp = document.getElementById("btn-close-otp");
  const otpMobileMask = document.getElementById("otp-mobile-mask");
  const demoOtpDisplay = document.getElementById("demo-otp-display");
  const otpInputFields = document.querySelectorAll(".otp-input-field");
  const errorOtpMsg = document.getElementById("error-otp");
  
  // Success page elements
  const successCaseId = document.getElementById("success-case-id");
  const btnCopyRef = document.getElementById("btn-copy-ref");
  const btnReturnHome = document.getElementById("btn-return-home");
  
  const tdCustomerName = document.getElementById("td-customer-name");
  const tdProduct = document.getElementById("td-product");
  const tdSubject = document.getElementById("td-subject");
  const tdEmail = document.getElementById("td-email");

  // State variables
  let currentCaptchaText = "";
  let currentMockOTP = "";

  // --- Initialize Page UI State ---
  generateCaptcha();
  toggleAccountNumberField();

  // --- Dynamic File Name Display ---
  fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
      fileNameLabel.textContent = fileInput.files[0].name;
    } else {
      fileNameLabel.textContent = "No file chosen";
    }
  });

  // --- Customer / Non-Customer Radio toggles ---
  isCustomerRadios.forEach(radio => {
    radio.addEventListener("change", toggleAccountNumberField);
  });

  function toggleAccountNumberField() {
    const isCustomer = document.querySelector('input[name="isCustomer"]:checked').value === "yes";
    if (isCustomer) {
      accountNumberGroup.classList.remove("hidden");
      accountNumberInput.required = true;
    } else {
      accountNumberGroup.classList.add("hidden");
      accountNumberInput.required = false;
      accountNumberInput.value = "";
      clearError(accountNumberInput);
    }
  }

  // --- Cascading Dropdowns Logic ---
  categorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    
    // Clear Sub Category
    subCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub Category</option>';
    subCategorySelect.disabled = true;
    
    // Clear Sub Sub Category
    subSubCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub Sub Category</option>';
    subSubCategorySelect.disabled = true;
    subSubCategoryGroup.classList.remove("hidden");
    subSubCategorySelect.required = true;

    if (selectedCategory && categoryData[selectedCategory]) {
      const subCategories = Object.keys(categoryData[selectedCategory]);
      subCategories.forEach(sub => {
        const option = document.createElement("option");
        option.value = sub;
        option.textContent = sub;
        subCategorySelect.appendChild(option);
      });
      subCategorySelect.disabled = false;
    }
    clearError(categorySelect);
  });

  subCategorySelect.addEventListener("change", () => {
    const selectedCategory = categorySelect.value;
    const selectedSubCategory = subCategorySelect.value;
    
    // Clear Sub Sub Category
    subSubCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub Sub Category</option>';
    subSubCategorySelect.disabled = true;

    if (selectedCategory && selectedSubCategory) {
      const subSubCategories = categoryData[selectedCategory][selectedSubCategory];
      
      if (subSubCategories && subSubCategories.length > 0) {
        subSubCategories.forEach(subSub => {
          const option = document.createElement("option");
          option.value = subSub;
          option.textContent = subSub;
          subSubCategorySelect.appendChild(option);
        });
        subSubCategorySelect.disabled = false;
        subSubCategoryGroup.classList.remove("hidden");
        subSubCategorySelect.required = true;
      } else {
        // If there are no sub-sub categories, hide the field container and make it not required
        subSubCategoryGroup.classList.add("hidden");
        subSubCategorySelect.required = false;
        
        // Add a default fallback value to pass to API
        const option = document.createElement("option");
        option.value = "";
        option.textContent = "N/A";
        option.selected = true;
        subSubCategorySelect.appendChild(option);
      }
    }
    clearError(subCategorySelect);
  });

  // Clear errors when fields are modified
  const inputsToClear = [
    productSelect, subSubCategorySelect, firstNameInput, lastNameInput, 
    accountNumberInput, detailsInput, emailIdInput, mobileNumberInput, captchaInput
  ];
  
  inputsToClear.forEach(input => {
    input.addEventListener("input", () => clearError(input));
    input.addEventListener("change", () => clearError(input));
  });

  function clearError(inputElement) {
    const group = inputElement.closest(".form-group");
    if (group) {
      group.classList.remove("invalid");
    }
  }

  function showError(inputElement) {
    const group = inputElement.closest(".form-group");
    if (group) {
      group.classList.add("invalid");
    }
  }

  // --- Captcha Generator ---
  btnRefreshCaptcha.addEventListener("click", () => {
    generateCaptcha();
    captchaInput.value = "";
    clearError(captchaInput);
  });

  function generateCaptcha() {
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz"; // Skip ambiguous like 0, O, I, 1, l
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptchaText = text;

    const ctx = captchaCanvas.getContext("2d");
    ctx.clearRect(0, 0, captchaCanvas.width, captchaCanvas.height);
    
    // Draw background grid lines (mimicking HDFC captcha grid lines)
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    for (let i = 0; i < captchaCanvas.width; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, captchaCanvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < captchaCanvas.height; i += 12) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(captchaCanvas.width, i);
      ctx.stroke();
    }

    // Draw characters
    ctx.font = "bold 26px monospace";
    ctx.textBaseline = "middle";
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      ctx.fillStyle = i % 2 === 0 ? "#1c3f60" : "#e11d48"; // Corporate colors for captcha text
      
      const x = 12 + i * 26;
      const y = captchaCanvas.height / 2 + (Math.random() * 8 - 4);
      
      // Save canvas state
      ctx.save();
      ctx.translate(x, y);
      
      // Add slight rotation
      const angle = (Math.random() * 20 - 10) * Math.PI / 180;
      ctx.rotate(angle);
      
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }

    // Draw noise dots
    for (let i = 0; i < 40; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? "#1c3f60" : "#e11d48";
      ctx.beginPath();
      ctx.arc(Math.random() * captchaCanvas.width, Math.random() * captchaCanvas.height, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- Validate Form Fields ---
  function validateForm() {
    let isValid = true;

    // Dropdowns
    if (!productSelect.value) { showError(productSelect); isValid = false; }
    if (!categorySelect.value) { showError(categorySelect); isValid = false; }
    if (!subCategorySelect.value) { showError(subCategorySelect); isValid = false; }
    if (subSubCategorySelect.required && !subSubCategorySelect.value) { showError(subSubCategorySelect); isValid = false; }

    // First/Last Name
    const firstName = firstNameInput.value.trim();
    if (!firstName || firstName.length < 2 || !/^[a-zA-Z]+$/.test(firstName)) {
      showError(firstNameInput);
      isValid = false;
    }
    const lastName = lastNameInput.value.trim();
    if (!lastName || lastName.length < 2 || !/^[a-zA-Z]+$/.test(lastName)) {
      showError(lastNameInput);
      isValid = false;
    }

    // Conditional Account Number
    const isCustomer = document.querySelector('input[name="isCustomer"]:checked').value === "yes";
    if (isCustomer) {
      const accNum = accountNumberInput.value.trim();
      if (!accNum || !/^\d{9,18}$/.test(accNum)) {
        showError(accountNumberInput);
        isValid = false;
      }
    }

    // Issue Description
    if (detailsInput.value.trim().length < 10) {
      showError(detailsInput);
      isValid = false;
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailIdInput.value.trim() || !emailRegex.test(emailIdInput.value.trim())) {
      showError(emailIdInput);
      isValid = false;
    }

    // Mobile Number
    if (!/^[6-9]\d{9}$/.test(mobileNumberInput.value.trim())) {
      showError(mobileNumberInput);
      isValid = false;
    }

    // Captcha Code validation bypassed as requested

    return isValid;
  }

  // --- Get OTP Action Click ---
  btnGetOtp.addEventListener("click", () => {
    if (validateForm()) {
      // 1. Generate 6-digit mock OTP (constant '123456' as requested)
      currentMockOTP = "123456";
      demoOtpDisplay.textContent = currentMockOTP;

      // 2. Set mobile mask in description
      const mob = mobileNumberInput.value.trim();
      otpMobileMask.textContent = `+${countryCodeInput.value || '91'} ******${mob.slice(-4)}`;

      // 3. Clear OTP digits input boxes
      otpInputFields.forEach(field => {
        field.value = "";
      });
      errorOtpMsg.style.display = "none";

      // 4. Show OTP Verification Overlay
      otpModal.classList.add("active");
      
      // Auto focus the first digit box
      setTimeout(() => otpInputFields[0].focus(), 100);
    } else {
      // Focus first error field
      const firstError = document.querySelector(".form-group.invalid input, .form-group.invalid select, .form-group.invalid textarea");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
        firstError.focus();
      }
    }
  });

  // --- OTP Verification Digits Auto-focus Flow ---
  otpInputFields.forEach((field, index) => {
    field.addEventListener("input", (e) => {
      // Allow only numbers
      field.value = field.value.replace(/\D/g, "");
      
      if (field.value.length === 1 && index < otpInputFields.length - 1) {
        otpInputFields[index + 1].focus();
      }
      errorOtpMsg.style.display = "none";
    });

    field.addEventListener("keydown", (e) => {
      if (e.key === "Backspace" && field.value.length === 0 && index > 0) {
        otpInputFields[index - 1].focus();
      }
    });

    // Handle paste event
    field.addEventListener("paste", (e) => {
      e.preventDefault();
      const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
      if (pasteData.length === 6) {
        for (let i = 0; i < 6; i++) {
          otpInputFields[i].value = pasteData[i];
        }
        otpInputFields[5].focus();
      }
    });
  });

  // --- Close OTP modal ---
  const closeModal = () => {
    otpModal.classList.remove("active");
  };
  btnCancelOtp.addEventListener("click", closeModal);
  btnCloseOtp.addEventListener("click", closeModal);

  // --- Verify OTP & Form Submission ---
  btnVerifyOtp.addEventListener("click", async () => {
    // Collect 6-digit entered OTP
    let enteredOTP = "";
    otpInputFields.forEach(field => {
      enteredOTP += field.value;
    });

    if (enteredOTP !== currentMockOTP) {
      errorOtpMsg.style.display = "block";
      return;
    }

    // Success OTP! Disable button and trigger API submit
    btnVerifyOtp.disabled = true;
    const originalVerifyBtnText = btnVerifyOtp.textContent;
    btnVerifyOtp.textContent = "Submitting...";

    const isCustomer = document.querySelector('input[name="isCustomer"]:checked').value === "yes";
    const fullName = firstNameInput.value.trim() + " " + lastNameInput.value.trim();
    
    // Construct case description
    let detailDescription = detailsInput.value.trim();
    if (addressInput.value.trim()) {
      detailDescription += `\n\n[Mailing Address: ${addressInput.value.trim()}]`;
    }
    detailDescription += `\n\n[Bank Customer: ${isCustomer ? 'Yes' : 'No'}]`;

    // Dynamic subject configuration
    const cat = categorySelect.value;
    const sub = subCategorySelect.value;
    const subSub = subSubCategorySelect.value;
    const subjectLine = subSub ? `${cat} - ${sub} - ${subSub}` : `${cat} - ${sub}`;

    const payload = {
      product: productSelect.value,
      category: cat,
      subCategory: sub,
      subSubCategory: subSub || sub,
      customerName: fullName,
      accountNumber: isCustomer ? accountNumberInput.value.trim() : "N/A (Non-customer)",
      isExistingCustomer: isCustomer,
      mobileNumber: (countryCodeInput.value || "91") + mobileNumberInput.value.trim(),
      emailId: emailIdInput.value.trim(),
      details: detailDescription,
      subject: subjectLine
    };

    try {
      // 1. Authenticate directly with CRM auth API
      const authUrl = 'https://presales1.businessbywire.com/restapigold8demo/oauth2/token';
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
        throw new Error('Authentication failed: ' + errorText);
      }

      const authData = await authResponse.json();
      const token = authData.access_token || authData.token || (authData.result && authData.result.token) || authData.accessToken;

      if (!token) {
        throw new Error('No access token returned from CRM authentication');
      }

      // 2. Submit case directly to CRM saveObject API
      const saveObjectUrl = 'https://presales1.businessbywire.com/restapigold8demo/crmWebApi/saveObject';
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
            "LayoutID": 103120,
            "ProcessID": 10001198,
            "Category": payload.category,
            "SubCategory": payload.subCategory,
            "SubCategory1": payload.subSubCategory,
            "StatusCode": "New Request",
            "Subject": payload.subject,
            "Product": payload.product,
            "Details": payload.details,
            "Cas_ex2_20": payload.customerName,
            "Cas_ex6_120": payload.accountNumber,
            "Cas_ex1_9": payload.mobileNumber,
            "Cas_ex1_3": payload.emailId,
            "XMLField_5729": "Website"
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
        throw new Error('CRM Case creation request failed: ' + errorText);
      }

      const saveResult = await saveResponse.json();
      
      // Extract Case ID from response
      let caseId = null;
      if (Array.isArray(saveResult) && saveResult.length > 0) {
        const firstResult = saveResult[0];
        if (firstResult.Errors && firstResult.Errors.length > 0) {
          throw new Error('CRM returned errors: ' + JSON.stringify(firstResult.Errors));
        }
        caseId = firstResult.ResponseData?.CaseId || firstResult.ResponseData?.ItemId || firstResult.ObjectKey;
      }

      if (!caseId) {
        caseId = saveResult[0]?.ResponseData?.CaseId || saveResult[0]?.ItemId || saveResult[0]?.ObjectKey || 'N/A';
      }

      // Render success page details
      successCaseId.textContent = caseId;
      tdCustomerName.textContent = fullName;
      tdProduct.textContent = payload.product;
      tdSubject.textContent = subjectLine;
      tdEmail.textContent = payload.emailId;

      // Close verification modal now
      closeModal();

      // Transition from Form page to Thank You page
      formWrapper.classList.add("hidden");
      thankYouWrapper.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });

    } catch (err) {
      alert("Error submitting request to CRM API: " + err.message);
      console.error("CRM submission error details:", err);
    } finally {
      // Restore submit button state
      btnVerifyOtp.disabled = false;
      btnVerifyOtp.textContent = originalVerifyBtnText;
    }
  });

  // --- Copy Case ID from Success screen ---
  btnCopyRef.addEventListener("click", () => {
    const textToCopy = successCaseId.textContent;
    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalText = btnCopyRef.innerHTML;
      btnCopyRef.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color:var(--success-color)">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        Copied!
      `;
      btnCopyRef.style.borderColor = "var(--success-color)";
      btnCopyRef.style.color = "var(--success-color)";
      
      setTimeout(() => {
        btnCopyRef.innerHTML = originalText;
        btnCopyRef.style.borderColor = "";
        btnCopyRef.style.color = "";
      }, 2000);
    });
  });

  // --- Return Home / Reset Portal ---
  btnReturnHome.addEventListener("click", () => {
    // Reset form fields
    caseForm.reset();
    
    // Clear select cascading dropdown states
    subCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub Category</option>';
    subCategorySelect.disabled = true;
    subSubCategorySelect.innerHTML = '<option value="" disabled selected>Select Sub Sub Category</option>';
    subSubCategorySelect.disabled = true;
    subSubCategoryGroup.classList.remove("hidden");
    subSubCategorySelect.required = true;

    // Reset captcha and conditional elements
    generateCaptcha();
    toggleAccountNumberField();
    
    // Remove invalid styling
    document.querySelectorAll(".form-group").forEach(group => {
      group.classList.remove("invalid");
    });
    fileNameLabel.textContent = "No file chosen";

    // Transition back to Form view
    thankYouWrapper.classList.add("hidden");
    formWrapper.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
