// src/utils/encryption.js
import crypto from 'crypto';
import { TOKEN_SECRET } from '../config.js';

// Utilizamos el TOKEN_SECRET como base para la clave de encriptación
// En un entorno de producción, sería mejor tener una clave separada específica para encriptación

/**
 * Encripta un texto utilizando AES-256-CBC
 * @param {string} text - Texto a encriptar
 * @param {string} userId - ID del usuario (se usa para derivar una clave única por usuario)
 * @returns {string} - Texto encriptado en formato base64
 */
export const encrypt = (text, userId) => {
  try {
    // Derivamos una clave única para cada usuario combinando TOKEN_SECRET con userId
    const key = crypto
      .createHash('sha256')
      .update(TOKEN_SECRET + userId)
      .digest();

    // Generamos un IV aleatorio
    const iv = crypto.randomBytes(16);

    // Creamos el cipher con la clave y el IV
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

    // Encriptamos el texto
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    // Combinamos el IV con el texto encriptado para almacenamiento
    // El IV puede ser público, pero es necesario para la desencriptación
    const result = iv.toString('base64') + ':' + encrypted;

    return result;
  } catch (error) {
    console.error('Error al encriptar:', error);
    throw new Error('Error al encriptar el texto');
  }
};

/**
 * Desencripta un texto previamente encriptado con encrypt()
 * @param {string} encryptedText - Texto encriptado en formato base64
 * @param {string} userId - ID del usuario (se usa para derivar la misma clave)
 * @returns {string} - Texto desencriptado
 */
export const decrypt = (encryptedText, userId) => {
  try {
    // Separamos el IV del texto encriptado
    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
      throw new Error('Formato de texto encriptado inválido');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const encrypted = parts[1];

    // Derivamos la misma clave que se usó para encriptar
    const key = crypto
      .createHash('sha256')
      .update(TOKEN_SECRET + userId)
      .digest();

    // Creamos el decipher con la clave y el IV
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

    // Desencriptamos el texto
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Error al desencriptar:', error);
    throw new Error('Error al desencriptar el texto');
  }
};
