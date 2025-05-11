import Task from '../models/task.model.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Función auxiliar para desencriptar tareas
const decryptTasksData = (tasks, userId) => {
  if (Array.isArray(tasks)) {
    return tasks.map((task) => {
      const taskObj = task.toObject ? task.toObject() : task;
      if (taskObj.encrypted) {
        try {
          taskObj.title = decrypt(taskObj.title, userId);
          taskObj.description = decrypt(taskObj.description, userId);
        } catch (error) {
          console.error('Error al desencriptar tarea:', error);
          // Si hay error en la desencriptación, mantenemos los datos encriptados
          // y agregamos una nota para el frontend
          taskObj._decryptError = true;
        }
      }
      return taskObj;
    });
  } else if (tasks && typeof tasks === 'object') {
    const taskObj = tasks.toObject ? tasks.toObject() : tasks;
    if (taskObj.encrypted) {
      try {
        taskObj.title = decrypt(taskObj.title, userId);
        taskObj.description = decrypt(taskObj.description, userId);
      } catch (error) {
        console.error('Error al desencriptar tarea:', error);
        taskObj._decryptError = true;
      }
    }
    return taskObj;
  }
  return tasks;
};

export const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.id,
    }).populate('user');

    // Desencriptamos los datos antes de enviarlos al cliente
    const decryptedTasks = decryptTasksData(tasks, req.user.id);

    res.json(decryptedTasks);
  } catch (error) {
    console.error('Error al obtener tareas:', error);
    return res.status(500).json({ message: 'Error al obtener las tareas' });
  }
};

export const createTasks = async (req, res) => {
  try {
    const { title, description, date } = req.body;

    // Encriptamos los datos sensibles
    const encryptedTitle = encrypt(title, req.user.id);
    const encryptedDescription = encrypt(description, req.user.id);

    const newTask = new Task({
      title: encryptedTitle,
      description: encryptedDescription,
      date,
      user: req.user.id,
      encrypted: true, // Marcamos que está encriptado
    });

    const savedTask = await newTask.save();

    // Desencriptamos para la respuesta
    const decryptedTask = decryptTasksData(savedTask, req.user.id);

    res.json(decryptedTask);
  } catch (error) {
    console.error('Error al crear tarea:', error);
    return res.status(500).json({ message: 'Error al crear la tarea' });
  }
};

export const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('user');
    if (!task)
      return res.status(404).json({
        message: 'Tarea no encontrada',
      });

    // Verificamos que la tarea pertenezca al usuario
    if (task.user._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para ver esta tarea' });
    }

    // Desencriptamos los datos
    const decryptedTask = decryptTasksData(task, req.user.id);

    res.json(decryptedTask);
  } catch (error) {
    console.error('Error al obtener tarea:', error);
    return res.status(404).json({ message: 'Tarea no encontrada' });
  }
};

export const deleteTasks = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Tarea no encontrada' });

    // Verificamos que la tarea pertenezca al usuario
    if (task.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para eliminar esta tarea' });
    }

    await Task.findByIdAndDelete(req.params.id);
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error al eliminar tarea:', error);
    return res.status(500).json({ message: 'Error al eliminar la tarea' });
  }
};

export const updateTasks = async (req, res) => {
  try {
    const taskToUpdate = await Task.findById(req.params.id);
    if (!taskToUpdate) {
      return res.status(404).json({
        message: 'Tarea no encontrada',
      });
    }

    // Verificamos que la tarea pertenezca al usuario
    if (taskToUpdate.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'No tienes permiso para actualizar esta tarea' });
    }

    const { title, description, date } = req.body;
    const updateData = {};

    // Solo encriptamos si se proporcionan nuevos valores
    if (title) {
      updateData.title = encrypt(title, req.user.id);
    }

    if (description) {
      updateData.description = encrypt(description, req.user.id);
    }

    if (date) {
      updateData.date = date;
    }

    // Aseguramos que siga marcada como encriptada
    updateData.encrypted = true;

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    // Desencriptamos para la respuesta
    const decryptedTask = decryptTasksData(task, req.user.id);

    res.json(decryptedTask);
  } catch (error) {
    console.error('Error al actualizar tarea:', error);
    return res.status(500).json({ message: 'Error al actualizar la tarea' });
  }
};
