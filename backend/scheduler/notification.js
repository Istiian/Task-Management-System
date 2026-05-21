import cron from 'node-cron';
import { sendEmail } from '../service/auth.service.js';
import Task from "../models/task.js";
import User from '../models/user.js';
import { Op } from 'sequelize';

// Schedule a task to run every 30 minutes
cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled task to send notifications...');
    const now = new Date();
    const fiveHoursFromNow = new Date(now.getTime() + 5 * 60 * 60 * 1000);
    const upcomingTasks = await Task.findAll({
        where: {
            deadline: {
                [Op.gte]: now,
                [Op.lte]: fiveHoursFromNow,
            },
            notificationSent: false,
        },
        include: [{ model: User, attributes: ['email'], required: true }],
    });
    
    console.log(`Now: ${now.toISOString()}, Found ${upcomingTasks.length} upcoming tasks with deadlines within the next 5 hours.`);
    try {
        for (const task of upcomingTasks) {
            const userEmail = task.User?.email;
            if (!userEmail) {
                console.warn(`Skipping task ${task.id} because no user email was loaded.`);
                continue;
            }
            
            await sendEmail({
                to: userEmail,
                subject: 'Upcoming Task Deadline',
                text: `You have an upcoming task: ${task.title} with a deadline at ${task.deadline}. Please make sure to complete it on time.`
            });
            task.notificationSent = true;
            await task.save();
        }
      
    } catch (error) {
        console.error('Error sending notifications:', error);
    }
});
