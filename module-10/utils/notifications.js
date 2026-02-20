const nodemailer = require('nodemailer');
const { logger } = require('./logger');

// Email transporter setup
const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Task reminder notifications
const sendTaskReminder = async (user, task) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@moodtodo.com',
            to: user.email,
            subject: `Reminder: ${task.title}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #9acd32;">Task Reminder</h2>
                    <p>Hi ${user.name},</p>
                    <p>This is a friendly reminder about your upcoming task:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin: 0; color: #333;">${task.title}</h3>
                        <p style="margin: 10px 0 0 0; color: #666;">
                            <strong>Duration:</strong> ${task.duration}<br>
                            <strong>Scheduled for:</strong> ${task.time}<br>
                            <strong>Mood:</strong> ${task.mood || 'Not specified'}
                        </p>
                    </div>
                    <p>Stay productive and keep up the great work!</p>
                    <p>Best regards,<br>The Mood Todo Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Task reminder sent', { userId: user._id, taskId: task._id });
    } catch (error) {
        logger.error('Failed to send task reminder', { error: error.message, userId: user._id });
    }
};

// Weekly summary notifications
const sendWeeklySummary = async (user, stats) => {
    try {
        const completionRate = stats.totalTasks > 0 ? 
            Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0;

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'noreply@moodtodo.com',
            to: user.email,
            subject: 'Your Weekly Productivity Summary',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #9acd32;">Weekly Summary</h2>
                    <p>Hi ${user.name},</p>
                    <p>Here's your productivity summary for this week:</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 20px;">
                            <div style="text-align: center;">
                                <h3 style="margin: 0; font-size: 2em; color: #9acd32;">${stats.completedTasks}</h3>
                                <p style="margin: 5px 0 0 0; color: #666;">Tasks Completed</p>
                            </div>
                            <div style="text-align: center;">
                                <h3 style="margin: 0; font-size: 2em; color: #3498db;">${completionRate}%</h3>
                                <p style="margin: 5px 0 0 0; color: #666;">Completion Rate</p>
                            </div>
                            <div style="text-align: center;">
                                <h3 style="margin: 0; font-size: 2em; color: #e74c3c;">${stats.streak}</h3>
                                <p style="margin: 5px 0 0 0; color: #666;">Day Streak</p>
                            </div>
                        </div>
                    </div>
                    
                    <p>Keep up the excellent work! Remember, consistency is key to building lasting habits.</p>
                    <p>Best regards,<br>The Mood Todo Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        logger.info('Weekly summary sent', { userId: user._id });
    } catch (error) {
        logger.error('Failed to send weekly summary', { error: error.message, userId: user._id });
    }
};

module.exports = {
    sendTaskReminder,
    sendWeeklySummary
};