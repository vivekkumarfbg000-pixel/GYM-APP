// Utility function to export member data to CSV
export function exportMembersToCSV(members: any[], filename: string = 'gymflow-members.csv') {
    // Define CSV headers
    const headers = [
        'Name',
        'Email',
        'Phone',
        'Segment',
        'Engagement Score',
        'Churn Risk',
        'Check-ins/Week',
        'Last Check-in',
        'Membership Type',
        'Membership End Date',
        'Total Revenue'
    ];

    // Convert members to CSV rows
    const rows = members.map(member => [
        member.name,
        member.email,
        member.phone,
        member.segment,
        member.engagementScore,
        member.churnRisk,
        member.checkInFrequency.toFixed(1),
        new Date(member.lastCheckIn).toLocaleDateString(),
        member.membershipType,
        member.membershipEndDate,
        `₹${member.totalRevenue}`
    ]);

    // Combine headers and rows
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Utility function to format currency
export function formatCurrency(amount: number): string {
    if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000) {
        return `₹${(amount / 1000).toFixed(0)}K`;
    }
    return `₹${amount.toFixed(0)}`;
}

// Utility function for animation variants
export const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
};

export const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 }
};
