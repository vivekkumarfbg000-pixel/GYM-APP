import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateMonthlyReport = async (stats: any, period: string) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185);
    doc.text("GymFlow AI - Monthly Report", 14, 20);

    // Subtitle
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${period}`, 14, 30);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 36);

    // Summary Cards Section
    const summaryData = [
        ['Total Revenue', `Rs ${stats.revenue.toLocaleString()}`],
        ['Active Members', stats.activeMembers.toString()],
        ['New Signups', stats.newMembers.toString()],
        ['Attendance Rate', `${stats.attendanceRate}%`],
    ];

    autoTable(doc, {
        startY: 45,
        head: [['Metric', 'Value']],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 12 }
    });

    // Recent Transaction Table (Mock/Sample)
    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("Recent High-Value Transactions", 14, (doc as any).lastAutoTable.finalY + 15);

    const transactions = stats.recentTransactions || [];
    const transactionRows = transactions.map((t: any) => [
        t.date, t.member, t.type, `Rs ${t.amount}`
    ]);

    autoTable(doc, {
        startY: (doc as any).lastAutoTable.finalY + 20,
        head: [['Date', 'Member', 'Service', 'Amount']],
        body: transactionRows.length ? transactionRows : [['No data', '-', '-', '-']],
        theme: 'striped',
    });

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Powered by GymFlow AI", 14, 280);

    doc.save(`gymflow-report-${period.replace(/\s/g, '_')}.pdf`);
};
