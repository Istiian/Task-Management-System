import express from 'express';
import { createTask, getArchivedTasks,getUnarchivedTasks, updateTask, archiveTask, unarchiveTask, deleteTask} from '../controller/task.controller.js';

const router = express.Router();

router.post('/create', createTask);
router.get('/list/archived', getArchivedTasks);
router.get('/list/unarchived', getUnarchivedTasks);
router.put('/update/:id', updateTask);
router.put('/archive/:id', archiveTask);
router.put('/unarchive/:id', unarchiveTask);
router.delete('/delete/:id', deleteTask);

export default router;



