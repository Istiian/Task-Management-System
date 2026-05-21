import express from 'express';
import { createTask, getTasks, updateTask, archivedTask,deleteTask} from '../controller/task.controller.js';

const router = express.Router();

router.post('/create', createTask);
router.get('/list', getTasks);
router.put('/update/:id', updateTask);
router.put('/archive/:id', archivedTask);
router.delete('/delete/:id', deleteTask);

export default router;



