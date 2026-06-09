import cron from 'node-cron';
import { sendEmail } from '../lib/nodemailer.js';
import Task from '../models/task.js';
import User from '../models/user.js';
import taskAssignees from '../models/task_assignees.js';
import { Op } from 'sequelize';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';

// Runs every 12 hours. Finds tasks due within the next 24 hours, emails each
// assignee once, and marks notificationSent = true to prevent duplicate emails.
cron.schedule('0 */12 * * *', async () => {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    try {
        const now = dayjs().tz('Asia/Shanghai').toDate();
        const oneDayFromNow = dayjs(now).tz('Asia/Shanghai').add(24, 'hour').toDate();

        const upcomingTasks = await Task.findAll({
            where: {
                deadline: { [Op.gte]: now, [Op.lte]: oneDayFromNow },
                notificationSent: false, // skip tasks that already had a notification sent
            },
            include: [{
                model: taskAssignees,
                as: 'taskAssignments',
                include: [{ model: User, as: 'user', attributes: ['email'] }],
            }],
        });

        for (const task of upcomingTasks) {
            const assignees = task.taskAssignments || [];

            for (const assignment of assignees) {
                const userEmail = assignment.user?.email;

                if (!userEmail) {
                    console.warn(`Skipping task ${task.id} for assignment ${assignment.id} because no user email was loaded.`);
                    continue;
                }

                // Mark before sending so a crash mid-loop doesn't cause double emails on retry
                task.notificationSent = true;
                await task.save();

                await sendEmail(
                    userEmail,
                    'Upcoming Task Deadline',
                    `You have an upcoming task: ${task.title} with a deadline at ${dayjs(task.deadline).tz('Asia/Shanghai').format('YYYY-MM-DD HH:mm')}. Please make sure to complete it on time.`
                );
            }
        }
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
});
