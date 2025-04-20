import { Router } from "express";
import { authRequired } from "../middlewares/validateToken.js";
import {
  getTasks,
  getTask,
  createTasks,
  updateTasks,
  deleteTasks,
} from "../controllers/tasks.controller.js";
const router = Router();
import { validateShema } from "../middlewares/validator.widdlewares.js";
import { createTaskSchema } from "../schemas/task.schema.js";

router.get("/tasks", authRequired, getTasks);
router.get("/tasks/:id", authRequired, getTask);
router.post(
  "/tasks",
  authRequired,
  validateShema(createTaskSchema),
  createTasks
);
router.delete("/tasks/:id", authRequired, deleteTasks);
router.put("/tasks/:id", authRequired, updateTasks);

export default router;
