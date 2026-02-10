import { logger } from './logger';

interface WelcomeWhatsAppParams {
    phoneNumber: string;
    memberName: string;
    email: string;
    password: string;
    gymName: string;
    appUrl?: string;
}

/**
 * Send welcome message via WhatsApp Business API
 * Uses Meta's WhatsApp Business API
 */
export async function sendWelcomeWhatsApp(params: WelcomeWhatsAppParams) {
    const {
        phoneNumber,
        memberName,
        email,
        password,
        gymName,
        appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gymflow-ai.vercel.app'
    } = params;

    try {
        const apiKey = process.env.WHATSAPP_API_KEY;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!apiKey || !phoneNumberId) {
            logger.warn('WhatsApp not configured, skipping notification');
            return { success: false, error: 'WhatsApp service not configured' };
        }

        // Format phone number (remove spaces, dashes, etc.)
        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

        // Create welcome message
        const message = `
🎉 *Welcome to ${gymName}, ${memberName}!*

Your GymFlow AI account is ready! 

*Your Login Credentials:*
📧 Email: ${email}
🔑 Password: \`${password}\`

*What You Can Do:*
💪 Generate AI Workouts
🥗 Chat with Diet Coach
🏆 Join Challenges
📊 Track Progress

👉 Login here: ${appUrl}/mobile/login

_Keep your credentials safe. You can change your password after logging in._

Need help? Contact your gym administrator.
    `.trim();

        // Send via WhatsApp Business API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanPhone,
                    type: 'text',
                    text: {
                        body: message,
                        preview_url: true // Enable link preview
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok || data.error) {
            logger.error('WhatsApp API error', data.error as Error, { phoneNumber: cleanPhone });
            return { success: false, error: data.error?.message || 'Failed to send WhatsApp' };
        }

        logger.info('WhatsApp welcome message sent', { phoneNumber: cleanPhone, messageId: data.messages?.[0]?.id });
        return { success: true, data };

    } catch (error: any) {
        logger.error('WhatsApp service error', error, { phoneNumber });
        return { success: false, error: error.message };
    }
}

/**
 * Send reminder via WhatsApp
 */
export async function sendWhatsAppReminder(
    phoneNumber: string,
    memberName: string,
    message: string
) {
    try {
        const apiKey = process.env.WHATSAPP_API_KEY;
        const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

        if (!apiKey || !phoneNumberId) {
            return { success: false, error: 'WhatsApp not configured' };
        }

        const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

        const response = await fetch(
            `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messaging_product: 'whatsapp',
                    to: cleanPhone,
                    type: 'text',
                    text: { body: message }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            return { success: false, error: data.error?.message };
        }

        logger.info('WhatsApp reminder sent', { phoneNumber: cleanPhone });
        return { success: true, data };

    } catch (error: any) {
        logger.error('WhatsApp reminder error', error);
        return { success: false, error: error.message };
    }
}
