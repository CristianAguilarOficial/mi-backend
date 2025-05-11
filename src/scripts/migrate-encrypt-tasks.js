// src/scripts/migrate-encrypt-tasks.js
// Script para encriptar tareas existentes en la base de datos

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Task from '../models/task.model.js';
import { encrypt } from '../utils/encryption.js';
import { MONGO_URI } from '../config.js';

dotenv.config();

const migrateEncryptTasks = async () => {
  try {
    // Conectar a la base de datos
    console.log('Conectando a la base de datos...');
    await mongoose.connect(MONGO_URI);
    console.log('Conexión exitosa a MongoDB');

    // Obtener todas las tareas no encriptadas
    const unencryptedTasks = await Task.find({
      $or: [{ encrypted: { $exists: false } }, { encrypted: false }],
    });

    console.log(
      `Se encontraron ${unencryptedTasks.length} tareas sin encriptar`
    );

    // Encriptar cada tarea
    let encryptedCount = 0;
    for (const task of unencryptedTasks) {
      try {
        const userId = task.user.toString();

        // Solo encriptar si los datos son strings (para evitar doble encriptación)
        const encryptedTitle =
          typeof task.title === 'string'
            ? encrypt(task.title, userId)
            : task.title;
        const encryptedDescription =
          typeof task.description === 'string'
            ? encrypt(task.description, userId)
            : task.description;

        // Actualizar tarea con datos encriptados
        await Task.findByIdAndUpdate(task._id, {
          title: encryptedTitle,
          description: encryptedDescription,
          encrypted: true,
        });

        encryptedCount++;
        console.log(
          `Tarea ${task._id} encriptada exitosamente (${encryptedCount}/${unencryptedTasks.length})`
        );
      } catch (error) {
        console.error(`Error al encriptar tarea ${task._id}:`, error);
      }
    }

    console.log(
      `\nMigración completada: ${encryptedCount} tareas encriptadas de ${unencryptedTasks.length}`
    );
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    // Cerrar conexión
    await mongoose.disconnect();
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  }
};

// Ejecutar la migración
migrateEncryptTasks();
