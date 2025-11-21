// aes-util.js
const CryptoJS = require('crypto-js');

/**
 * AesUtil class (same API as your original browser code)
 */
class AesUtil {
  constructor(keySize, iterationCount) {
    // keySize expected in bits (e.g. 128, 192, 256)
    this.keySize = keySize / 32; // CryptoJS wants keySize in words (32 bits each)
    this.iterationCount = iterationCount;
  }

  generateKey(saltHex, passPhrase) {
    return CryptoJS.PBKDF2(
      passPhrase,
      CryptoJS.enc.Hex.parse(saltHex),
      { keySize: this.keySize, iterations: this.iterationCount }
    );
  }

  encrypt(saltHex, ivHex, passPhrase, plainText) {
    const key = this.generateKey(saltHex, passPhrase);
    const encrypted = CryptoJS.AES.encrypt(
      plainText,
      key,
      { iv: CryptoJS.enc.Hex.parse(ivHex) }
    );
    // return ciphertext as Base64 string (same output shape as your browser version)
    return encrypted.ciphertext.toString(CryptoJS.enc.Base64);
  }

  decrypt(saltHex, ivHex, passPhrase, cipherTextBase64) {
    const key = this.generateKey(saltHex, passPhrase);
    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: CryptoJS.enc.Base64.parse(cipherTextBase64)
    });
    const decrypted = CryptoJS.AES.decrypt(
      cipherParams,
      key,
      { iv: CryptoJS.enc.Hex.parse(ivHex) }
    );
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
}

/**
 * Factory to create AesUtil instances (keeps your original API style)
 */
function AesUtilFactory(keySize = 128, iterationCount = 10000) {
  return new AesUtil(keySize, iterationCount);
}

/**
 * Default config (same defaults as your browser code)
 */
function getDefaultConfig() {
  return {
      keySize: 128,
      iterationCount: 10000,
      iv: CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex),
      salt: CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex),
      passPhrase: "vs@123"
    };
}

/**
 * Helper to decode the wrapper string (base64 decode)
 */
function getDecodedString(encodedString) {
  return Buffer.from(encodedString, 'base64').toString('utf8');
}

/**
 * Helper to base64-encode the wrapper
 */
function makeBase64String(config, cipherText) {
  const combined = `${config.keySize}::${config.iterationCount}::${config.iv}::${config.salt}::${cipherText}`;
  return Buffer.from(combined, 'utf8').toString('base64');
}

/**
 * Parse the wrapper and return config + cipherText
 */
function extractConfig(wrappedBase64) {
  const decodedString = getDecodedString(wrappedBase64);
  const parts = decodedString.split('::');
  return {
    keySize: parseInt(parts[0], 10),
    iterationCount: parseInt(parts[1], 10),
    iv: parts[2],
    salt: parts[3],
    passPhrase: getDefaultConfig().passPhrase,
    cipherText: parts[4]
  };
}

/**
 * High-level helper that uses default config and returns a wrapped base64 string
 */
function encryptData(data) {
  const config = getDefaultConfig();
  const aes = AesUtilFactory(config.keySize, config.iterationCount);
  const cipherTextBase64 = aes.encrypt(config.salt, config.iv, config.passPhrase, data);
  return makeBase64String(config, cipherTextBase64);
}

/**
 * High-level helper that unwraps the base64 wrapper and decrypts the payload
 */
function decryptData(wrappedBase64) {
  const config = extractConfig(wrappedBase64);
  const aes = AesUtilFactory(config.keySize, config.iterationCount);
  return aes.decrypt(config.salt, config.iv, config.passPhrase, config.cipherText);
}

/**
 * Exports
 */
export { AesUtilFactory as AesUtil };
export { encryptData, decryptData };
