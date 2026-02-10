import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withErrorHandler, ApiErrors } from '@/lib/api-error-handler';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';

// Define the shape of a CSV row
interface MemberImportRow {
    name: string;
    email: string;
    phone?: string;
    membership_type?: string;
    password?: string; // Optional custom password
}

const REQUIRED_FIELDS = ['name', 'email'];

async function handler(req: NextRequest) {
    try {
        const body = await req.json();
        const { members, gymOwnerId, sendEmails = true } = body;

        if (!members || !Array.isArray(members) || members.length === 0) {
            throw ApiErrors.badRequest('No member data provided');
        }

        if (!gymOwnerId) {
            throw ApiErrors.badRequest('Gym Owner ID is required');
        }

        logger.info(`Starting bulk import of ${members.length} members`, { gymOwnerId });

        const results = {
            total: members.length,
            success: 0,
            failed: 0,
            errors: [] as any[],
            warnings: [] as string[]
        };

        const successfulMembers: any[] = [];

        // Process each member
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            const rowNumber = i + 1;

            try {
                // 1. Validation
                const missingFields = REQUIRED_FIELDS.filter(field => !member[field]);
                if (missingFields.length > 0) {
                    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
                }

                if (!member.email.includes('@')) {
                    throw new Error('Invalid email address');
                }

                // 2. Check for existing email (optimization: could do batch check, but loop is safer for detailed errors)
                const { data: existing } = await supabase
                    .from('members')
                    .select('email')
                    .eq('email', member.email)
                    .maybeSingle();

                if (existing) {
                    throw new Error(`Email ${member.email} already exists`);
                }

                // 3. Prepare data
                // Generate a default password if not provided
                // Format: Firstname123! or provided
                const plainPassword = member.password || `${member.name.split(' ')[0]}123!`;
                const hashedPassword = await bcrypt.hash(plainPassword, 10);

                const newMember = {
                    name: member.name,
                    email: member.email,
                    phone: member.phone || '',
                    password: hashedPassword,
                    gym_owner_id: gymOwnerId,
                    membership_type: member.membership_type || 'Monthly',
                    status: 'Active',
                    join_date: new Date().toISOString(),
                    role: 'member',
                    approved: true
                };

                // 4. Insert into DB
                const { data: inserted, error: insertError } = await supabase
                    .from('members')
                    .insert([newMember])
                    .select()
                    .single();

                if (insertError) {
                    throw new Error(insertError.message);
                }

                // 5. Send Notification (Async/Non-blocking)
                if (sendEmails && inserted) {
                    // We'll queue this promise but not await it to speed up the loop
                    // In a production app, use a queue like BullMQ
                    sendWelcomeNotification(member.email, member.name, plainPassword, member.phone)
                        .catch(err => logger.error('Failed to send welcome notif', err, { email: member.email }));
                }

                results.success++;
                successfulMembers.push(inserted);

            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    row: rowNumber,
                    name: member.name || 'Unknown',
                    email: member.email || 'Unknown',
                    error: error.message
                });
                logger.warn(`Import failed for row ${rowNumber}`, { error: error.message });
            }
        }

        logger.info('Bulk import completed', results, gymOwnerId);

        return NextResponse.json({
            success: true,
            results,
            message: `Imported ${results.success} members. Failed: ${results.failed}`
        });

    } catch (error: any) {
        logger.error('Bulk import fatal error', error);
        throw ApiErrors.internal('Bulk import failed unexpectedy');
    }
}

// Optimization: Separate function to keep the loop clean
async function sendWelcomeNotification(email: string, name: string, password: string, phone?: string) {
    try {
        // Dynamic import to avoid circular dependencies if any (though unlikely here)
        const { sendWelcomeEmail } = await import('@/lib/email');
        const { sendWelcomeWhatsApp } = await import('@/lib/whatsapp');

        await sendWelcomeEmail({
            memberEmail: email,
            memberName: name,
            password: password,
            gymName: process.env.GYM_NAME || 'GymFlow AI'
        });

        if (phone) {
            await sendWelcomeWhatsApp({
                phoneNumber: phone,
                memberName: name,
                email: email,
                password: password,
                gymName: process.env.GYM_NAME || 'GymFlow AI'
            });
        }
    } catch (e) {
        // Logs handled by caller
        throw e;
    }
}

export const POST = withErrorHandler(handler);
