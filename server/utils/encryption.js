// const crypto = require('crypto');

// /**
//  * Encryption utility for sensitive data like social media API tokens
//  * Uses AES-256-GCM for authenticated encryption
//  */

// class Encryption {
//   constructor() {
//     // Get encryption key from environment variable
//     this.algorithm = 'aes-256-gcm';
//     this.key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-123', 'utf8');
    
//     if (!process.env.ENCRYPTION_KEY) {
//       console.warn('⚠️  ENCRYPTION_KEY not set in environment variables. Using default key for development only.');
//     }
//   }

//   /**
//    * Encrypt sensitive data
//    * @param {string} text - Data to encrypt
//    * @returns {string} - Encrypted data as base64 string
//    */
//   encrypt(text) {
//     try {
//       if (!text) return null;
      
//       const iv = crypto.randomBytes(16);
//       const cipher = crypto.createCipher(this.algorithm, this.key);
      
//       let encrypted = cipher.update(text, 'utf8', 'hex');
//       encrypted += cipher.final('hex');
      
//       const authTag = cipher.getAuthTag();
      
//       // Combine IV, encrypted data, and auth tag
//       const result = iv.toString('hex') + ':' + encrypted + ':' + authTag.toString('hex');
//       return result;
//     } catch (error) {
//       console.error('Encryption error:', error);
//       throw new Error('Failed to encrypt data');
//     }
//   }

//   /**
//    * Decrypt sensitive data
//    * @param {string} encryptedText - Encrypted data as base64 string
//    * @returns {string} - Decrypted data
//    */
//   decrypt(encryptedText) {
//     try {
//       if (!encryptedText) return null;
      
//       const parts = encryptedText.split(':');
//       if (parts.length !== 3) {
//         throw new Error('Invalid encrypted data format');
//       }
      
//       const iv = Buffer.from(parts[0], 'hex');
//       const encrypted = parts[1];
//       const authTag = Buffer.from(parts[2], 'hex');
      
//       const decipher = crypto.createDecipher(this.algorithm, this.key);
//       decipher.setAuthTag(authTag);
      
//       let decrypted = decipher.update(encrypted, 'hex', 'utf8');
//       decrypted += decipher.final('utf8');
      
//       return decrypted;
//     } catch (error) {
//       console.error('Decryption error:', error);
//       throw new Error('Failed to decrypt data');
//     }
//   }

//   /**
//    * Check if a string is encrypted
//    * @param {string} text - String to check
//    * @returns {boolean} - True if encrypted
//    */
//   isEncrypted(text) {
//     if (!text) return false;
//     return text.includes(':') && text.split(':').length === 3;
//   }
// }

// // Create singleton instance
// const encryption = new Encryption();

// module.exports = encryption; 

const crypto = require('crypto');

/**
 * Encryption utility using AES-256-GCM
 */
class Encryption {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    const key = process.env.ENCRYPTION_KEY || 'default-key-32-chars-long-123456';
    
    if (key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 characters long (256 bits)');
    }

    this.key = Buffer.from(key, 'utf8');
    
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('⚠️  ENCRYPTION_KEY not set. Using insecure default key for development only.');
    }
  }

  encrypt(text) {
    try {
      if (!text) return null;

      const iv = crypto.randomBytes(12); // 12 bytes for GCM
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

      const encrypted = Buffer.concat([
        cipher.update(text, 'utf8'),
        cipher.final()
      ]);

      const authTag = cipher.getAuthTag();

      return [
        iv.toString('hex'),
        encrypted.toString('hex'),
        authTag.toString('hex')
      ].join(':');
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(encryptedText) {
    try {
      if (!encryptedText) return null;

      const [ivHex, encryptedHex, authTagHex] = encryptedText.split(':');
      if (!ivHex || !encryptedHex || !authTagHex) {
        throw new Error('Invalid encrypted format');
      }

      const iv = Buffer.from(ivHex, 'hex');
      const encrypted = Buffer.from(encryptedHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      const decrypted = Buffer.concat([
        decipher.update(encrypted),
        decipher.final()
      ]);

      return decrypted.toString('utf8');
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  isEncrypted(text) {
    return typeof text === 'string' && text.split(':').length === 3;
  }
}

module.exports = new Encryption();
