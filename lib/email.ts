import { logger } from './logger';

interface WelcomeEmailParams {
    memberEmail: string;
    memberName: string;
    password: string;
    gymName: string;
    appUrl?: string;
}

/**
 * Send welcome email to new member using Resend
 * Note: Install resend package: npm install resend
 */
export async function sendWelcomeEmail(params: WelcomeEmailParams) {
    const { memberEmail, memberName, password, gymName, appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://gymflow-ai.vercel.app' } = params;

    try {
        // Check if Resend is configured
        if (!process.env.RESEND_API_KEY) {
            logger.warn('Resend API key not configured, skipping email');
            return { success: false, error: 'Email service not configured' };
        }

        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);

        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
        .content { padding: 30px; }
        .credentials-box { background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
        .credential-item { margin: 10px 0; }
        .credential-label { font-weight: bold; color: #333; }
        .credential-value { background-color: #e9ecef; padding: 8px 12px; border-radius: 4px; display: inline-block; margin-left: 10px; font-family: monospace; }
        .features { margin: 30px 0; }
        .feature-item { display: flex; align-items: center; margin: 15px 0; }
        .feature-icon { background-color: #e7f3ff; color: #667eea; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-center; margin-right: 15px; font-size: 20px; }
        .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🎉 Welcome to ${gymName}!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Your fitness journey starts here</p>
        </div>
        
        <div class="content">
            <h2 style="color: #333;">Hi ${memberName},</h2>
            <p style="color: #666; line-height: 1.6;">
                Welcome to GymFlow AI! Your account has been created successfully. 
                You now have access to cutting-edge AI-powered fitness tools designed to help you achieve your goals.
            </p>
            
            <div class="credentials-box">
                <h3 style="margin-top: 0; color: #667eea;">Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">📧 Email:</span>
                    <span class="credential-value">${memberEmail}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">🔑 Password:</span>
                    <span class="credential-value">${password}</span>
                </div>
                <p style="margin-top: 15px; font-size: 13px; color: #666;">
                    <strong>Important:</strong> Please keep these credentials safe. We recommend changing your password after your first login.
                </p>
            </div>
            
            <div class="features">
                <h3 style="color: #333;">What You Can Do:</h3>
                
                <div class="feature-item">
                    <div class="feature-icon">🏋️</div>
                    <div>
                        <strong>AI Workout Generator</strong><br>
                        <span style="color: #666; font-size: 14px;">Get personalized workout plans in seconds</span>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🥗</div>
                    <div>
                        <strong>AI Diet Coach</strong><br>
                        <span style="color: #666; font-size: 14px;">24/7 nutrition advice tailored to your goals</span>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">🏆</div>
                    <div>
                        <strong>Community Challenges</strong><br>
                        <span style="color: #666; font-size: 14px;">Compete and stay motivated with fellow members</span>
                    </div>
                </div>
                
                <div class="feature-item">
                    <div class="feature-icon">📊</div>
                    <div>
                        <strong>Progress Tracking</strong><br>
                        <span style="color: #666; font-size: 14px;">Monitor your fitness journey with detailed analytics</span>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${appUrl}/mobile/login" class="cta-button">Login to Your Account →</a>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
                Need help? Contact your gym administrator or reply to this email.
            </p>
        </div>
        
        <div class="footer">
            <p style="margin: 0;">
                © ${new Date().getFullYear()} ${gymName} powered by GymFlow AI<br>
                This email was sent because an account was created for you at ${gymName}.
            </p>
        </div>
    </div>
</body>
</html>
        `;

        const { data, error } = await resend.emails.send({
            from: `${gymName} <onboarding@resend.dev>`, // Use your verified domain
            to: [memberEmail],
            subject: `Welcome to ${gymName}! Your Account is Ready 🎉`,
            html: emailHtml,
        });

        if (error) {
            logger.error('Failed to send welcome email', error as Error, { memberEmail });
            return { success: false, error: error.message };
        }

        logger.info('Welcome email sent successfully', { memberEmail, emailId: data?.id });
        return { success: true, data };

    } catch (error: any) {
        logger.error('Email service error', error, { memberEmail });
        return { success: false, error: error.message };
    }
}
