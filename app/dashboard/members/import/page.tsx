'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ImportedMember {
    name: string;
    email: string;
    phone?: string;
    membership_type?: string;
    status?: 'pending' | 'success' | 'error';
    error?: string;
}

export default function ImportMembersPage() {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [parsedData, setParsedData] = useState<ImportedMember[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [importStats, setImportStats] = useState<{ success: number; failed: number } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            parseFile(selectedFile);
        }
    };

    const parseFile = (file: File) => {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            toast.error('Please upload a CSV file');
            return;
        }

        setFile(file);
        setImportStats(null);

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length === 0) {
                    toast.error('CSV file is empty');
                    return;
                }

                // Validate headers
                const headers = results.meta.fields;
                if (!headers?.includes('name') || !headers?.includes('email')) {
                    toast.error('CSV must contain "name" and "email" columns');
                    setFile(null);
                    return;
                }

                const members = results.data.map((row: any) => ({
                    name: row.name,
                    email: row.email,
                    phone: row.phone,
                    membership_type: row.membership_type,
                    status: 'pending'
                })) as ImportedMember[];

                setParsedData(members);
                toast.success(`Parsed ${members.length} members found`);
            },
            error: (error) => {
                toast.error(`Error parsing CSV: ${error.message}`);
            }
        });
    };

    const handleImport = async () => {
        if (parsedData.length === 0) return;

        setIsUploading(true);
        const gymOwnerId = localStorage.getItem('gymflow_owner_id');

        try {
            const res = await fetch('/api/members/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    members: parsedData,
                    gymOwnerId
                })
            });

            const data = await res.json();

            if (data.success) {
                setImportStats({
                    success: data.results.success,
                    failed: data.results.failed
                });

                // Update local status for preview
                if (data.results.errors.length > 0) {
                    const newParsed = [...parsedData];
                    data.results.errors.forEach((err: any) => {
                        // Matches by index (row - 1) logic if order preserved, 
                        // but safer to match by email if unique, or just trust the response count
                        const index = err.row - 1;
                        if (newParsed[index]) {
                            newParsed[index].status = 'error';
                            newParsed[index].error = err.error;
                        }
                    });
                    setParsedData(newParsed);
                    toast.warning(`Imported with ${data.results.failed} errors`);
                } else {
                    toast.success('All members imported successfully!');
                    setTimeout(() => router.push('/dashboard/members'), 2000);
                }
            } else {
                toast.error(data.error || 'Import failed');
            }
        } catch (error) {
            console.error(error);
            toast.error('Import failed due to server error');
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        const csvContent = "name,email,phone,membership_type\nJohn Doe,john@example.com,1234567890,Monthly\nJane Smith,jane@example.com,0987654321,Annual";
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gymflow_members_template.csv';
        a.click();
    };

    return (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Import Members</h1>
                    <p className="text-gray-500">Bulk upload members via CSV file</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Upload Section */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Upload CSV</CardTitle>
                        <CardDescription>Select a .csv file with member details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${file ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'}`}
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                                e.preventDefault();
                                const droppedFile = e.dataTransfer.files[0];
                                if (droppedFile) parseFile(droppedFile);
                            }}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".csv"
                                onChange={handleFileChange}
                            />

                            {file ? (
                                <div className="space-y-2">
                                    <FileText className="mx-auto text-green-600" size={32} />
                                    <p className="font-medium text-sm text-green-700 truncate px-4">{file.name}</p>
                                    <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Upload className="mx-auto text-gray-400" size={32} />
                                    <p className="font-medium text-sm text-gray-700">Click or drag file here</p>
                                    <p className="text-xs text-gray-500">Max 5MB</p>
                                </div>
                            )}
                        </div>

                        <div className="text-center">
                            <button
                                onClick={downloadTemplate}
                                className="text-xs text-blue-600 hover:underline font-medium"
                            >
                                Download CSV Template
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Section */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Preview</CardTitle>
                            <CardDescription>
                                {parsedData.length > 0
                                    ? `Reviewing ${parsedData.length} members`
                                    : 'Upload a file to see preview'}
                            </CardDescription>
                        </div>
                        {parsedData.length > 0 && !importStats && (
                            <Button onClick={handleImport} disabled={isUploading}>
                                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Import {parsedData.length} Members
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent>
                        {importStats && (
                            <div className="mb-6 p-4 bg-gray-50 rounded-lg border flex gap-6">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle size={20} />
                                    <span className="font-bold">{importStats.success}</span> Success
                                </div>
                                <div className="flex items-center gap-2 text-red-700">
                                    <AlertCircle size={20} />
                                    <span className="font-bold">{importStats.failed}</span> Failed
                                </div>
                            </div>
                        )}

                        <div className="border rounded-lg overflow-hidden max-h-[400px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-gray-50 text-gray-700 font-medium sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3">Name</th>
                                        <th className="px-4 py-3">Email</th>
                                        <th className="px-4 py-3">Phone</th>
                                        <th className="px-4 py-3">Type</th>
                                        <th className="px-4 py-3 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {parsedData.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                No data to display
                                            </td>
                                        </tr>
                                    ) : (
                                        parsedData.map((member, i) => (
                                            <tr key={i} className="hover:bg-gray-50">
                                                <td className="px-4 py-3">{member.name}</td>
                                                <td className="px-4 py-3 text-gray-600">{member.email}</td>
                                                <td className="px-4 py-3 text-gray-500">{member.phone || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                                                        {member.membership_type || 'Monthly'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {member.status === 'error' ? (
                                                        <span className="text-red-500 text-xs font-medium" title={member.error}>
                                                            {member.error || 'Error'}
                                                        </span>
                                                    ) : member.status === 'success' ? (
                                                        <span className="text-green-500 text-xs font-medium">Success</span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">Pending</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
