import cron from 'node-cron';
import { sendEmail } from '../lib/nodemailer.js';
import Task from "../models/task.js";
import User from '../models/user.js';
import taskAssignees from '../models/task_assignees.js';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Schedule a task to run every 30 second
cron.schedule('*/30 * * * * *', async () => {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    try {
        const now = dayjs().tz('Asia/Shanghai').toDate();
        const oneDayFromNow = dayjs(now).tz('Asia/Shanghai').add(24, 'hour').toDate();
        const upcomingTasks = await Task.findAll({
            where: {
                deadline: {
                    [Op.gte]: now,
                    [Op.lte]: oneDayFromNow,
                },
                notificationSent: false,
            },
            include: [{
                model: taskAssignees,
                as: 'taskAssignments',
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['email']
                }],
            }]
        });
        for (const task of upcomingTasks) {

            const assignees = task.taskAssignments || [];

            for (const assignment of assignees) {
                const userEmail = assignment.user?.email;

                if (!userEmail) {
                    console.warn(`Skipping task ${task.id} for assignment ${assignment.id} because no user email was loaded.`);
                    continue;
                }
                task.notificationSent = true;
                await task.save();
                await sendEmail(userEmail, 'Upcoming Task Deadline', `You have an upcoming task: ${task.title} with a deadline at ${dayjs(task.deadline).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm')}. Please make sure to complete it on time.`);

            }

        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
});
