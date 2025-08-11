const KYC = require("../models/KYC");
const User = require("../models/User");
const logger = require("../utils/logger");

function isValidAccountNumber(accountNumber) {
  return /^\d+$/.test(accountNumber);
}

function isValidIFSC(ifsc) {
  return /^[A-Za-z0-9]+$/.test(ifsc);
}

function isValidAadhar(aadharNumber) {
  return /^\d{12}$/.test(aadharNumber);
}

function isValidPAN(pan) {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(pan);
}

// Only digits (6-18 digits common for Indian banks)
function isValidAccountNumber(accountNumber) {
  return /^\d{6,18}$/.test(accountNumber);
}

// IFSC: 4 letters + 0 + 6 alphanumeric (standard RBI format)
function isValidIFSC(ifsc) {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
}

// Account holder name: only letters, spaces, periods (at least 3 chars)
function isValidAccountName(name) {
  return /^[A-Za-z .]{3,}$/.test(name);
}

// Bank name: alphabet and spaces, at least 3 characters
function isValidBankName(name) {
  return /^[A-Za-z ]{3,}$/.test(name);
}

// UPI ID: <id>@<provider> (e.g., name@okicici)
function isValidUPI(upi) {
  return /^[\w.-]{2,256}@[a-zA-Z]{2,64}$/.test(upi);
}

exports.uploadKYC = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { pancardNumber, aadharNumber } = req.body;
    // console.log(req.files)
    const pancardImage = req.files?.pancardImage?.[0]?.path;
    const aadharFront = req.files?.aadharFront?.[0]?.path;
    const aadharBack = req.files?.aadharBack?.[0]?.path;
    // console.log(pancardNumber, aadharNumber )
    if (
      !pancardNumber ||
      !aadharNumber ||
      !pancardImage ||
      !aadharFront ||
      !aadharBack
    ) {
      return res.status(400).json({
        success: false,
        message: "All KYC document details and images are required.",
      });
    }
    if (!isValidPAN(pancardNumber)) {
    return res.status(400).json({ message: 'Invalid PAN card number.' });
  }

  if (!isValidAadhar(aadharNumber)) {
    return res.status(400).json({ message: 'Invalid Aadhaar number.' });
  }
    const pancard = {
      number: pancardNumber,
      image: pancardImage,
    };

    const aadhar = {
      number: aadharNumber,
      front: aadharFront,
      back: aadharBack,
    };
    console.log(pancard);
    let kyc = await KYC.findOne({ userId });
    console.log(kyc);
    if (kyc) {
      kyc.pancard = pancard;
      kyc.aadhar = aadhar;
      kyc.verified = false;
      kyc.verificationNotes = "";
      kyc.verifiedBy = null;
      kyc.verifiedAt = null;
    } else {
      kyc = new KYC({
        userId,
        pancard,
        aadhar,
      });
    }
    console.log("1");
    console.log(kyc);
    await kyc.save();

    res.json({
      success: true,
      message: "KYC documents uploaded successfully. Verification pending.",
      data: {
        id: kyc._id,
        verified: kyc.verified,
        submittedAt: kyc.createdAt,
      },
    });
  } catch (error) {
    // logger.error('KYC upload error:', error);
    res.status(500).json({
      success: false,
      message: "Error uploading KYC documents",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

// Get wallet balance
exports.getBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const kyc = await KYC.findOne({ userId });

    if (!kyc) {
      return res.json({
        success: true,
        data: {
          available: 0,
          locked: 0,
          kycVerified: false,
          kycSubmitted: false,
        },
      });
    }

    res.json({
      success: true,
      data: {
        available: kyc.balance.available,
        locked: kyc.balance.locked,
        kycVerified: kyc.verified,
        kycSubmitted: true,
        kycStatus: kyc.verified ? "verified" : "pending",
      },
    });
  } catch (error) {
    // logger.error('Get balance error:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching wallet balance",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
// Upload bank and upi details
exports.submitBankAndUPI = async (req, res) => {
  try {
    const userId = req.user.userId;
    const {
      accountHolderName,
      accountNumber,
      bankName,
      ifscCode,
      googlePay,
      phonePe,
      paytm,
    } = req.body;
    // if (!accountHolderName || !accountNumber || !bankName || !ifscCode) {
    //   return res.status(400).json({
    //     success: false,
    //     message:
    //       "All bank details (accountHolderName, accountNumber, bankName, ifscCode) are required.",
    //   });
    // }
    if (!isValidAccountNumber(accountNumber)) {
    return res.status(400).json({ message: 'Invalid account number.' });
  }

  if (!isValidIFSC(ifscCode)) {
    return res.status(400).json({ message: 'Invalid IFSC code.' });
  }

  if (!isValidAccountName(accountHolderName)) {
    return res.status(400).json({ message: 'Invalid account name.' });
  }

  if (!isValidBankName(bankName)) {
    return res.status(400).json({ message: 'Invalid bank name.' });
  }
  if(googlePay){
    if (!isValidUPI(googlePay)) {
    return res.status(400).json({ message: 'Invalid Google Pay UPI ID.' });
  }
  }
  if(phonePe){
    if (!isValidUPI(phonePe)) {
    return res.status(400).json({ message: 'Invalid PhonePe UPI ID.' });
  }
  }if(paytm){
    if (!isValidUPI(paytm)) {
    return res.status(400).json({ message: 'Invalid Paytm UPI ID.' });
  }
  }
    const kyc = await KYC.findOne({ userId });
    if (!kyc) {
      return res.status(404).json({
        success: false,
        message: "KYC record not found",
      });
    }

    kyc.bankDetails = { accountHolderName, accountNumber, bankName, ifscCode };
    kyc.upiDetails = { googlePay, phonePe, paytm };
    await kyc.save();

    res.json({
      success: true,
      message: "Bank and UPI details submitted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting bank/UPI details",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.getKYCStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const kyc = await KYC.findOne({ userId });

    if (!kyc) {
      return res.json({
        success: true,
        data: {
          submitted: false,
          verified: false,
          status: "not_submitted",
          // bankVerificationStatus: 'not_submitted'
        },
      });
    }

    res.json({
      success: true,
      data: {
        submitted: true,
        verified: kyc.verified,
        status: kyc.verified
          ? "KYC details verified"
          : "KYC verification pending!",
        submittedAt: kyc.createdAt,
        verifiedAt: kyc.verifiedAt,
        notes: kyc.verificationNotes,
        bankVerificationStatus: kyc.bankVerified
          ? "Bank details verified"
          : "Bank details verification pending!",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching KYC status",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};

exports.approveKYCByAdmin = async (req, res) => {
  try {
    const { userId } = req.body;
    const adminId = req.user.userId;

    const kyc = await KYC.findOne({ userId });

    if (!kyc) {
      return res
        .status(404)
        .json({ success: false, message: "KYC record not found" });
    }

    if (kyc.verified) {
      return res.json({ success: true, message: "KYC already verified" });
    }

    kyc.verified = true;
    kyc.verifiedBy = adminId;
    kyc.verifiedAt = new Date();
    kyc.verificationNotes = req.body.verificationNotes || "";

    await kyc.save();

    res.json({
      success: true,
      message: "KYC verified successfully",
      data: {
        verifiedAt: kyc.verifiedAt,
        verifiedBy: kyc.verifiedBy,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error approving KYC",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  }
};
