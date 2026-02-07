import { useState } from 'react';
import { Upload, Scan, Loader2, FileCode, ArrowLeft } from 'lucide-react';
import ResultsPageNew from './ResultsPageNew';

const SCAN_PHASES = [
    'Analyzing Contract (Slither + Mythril)...',
];

interface ScannerPageSimpleProps {
    onBack?: () => void;
}

export default function ScannerPageSimple({ onBack }: ScannerPageSimpleProps) {
    const [file, setFile] = useState<File | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    // Results state
    const [showResults, setShowResults] = useState(false);
    const [scanResults, setScanResults] = useState<any>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.name.endsWith('.sol')) {
                setFile(droppedFile);
                setError(null);
            } else {
                setError('Please upload a .sol file');
            }
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.name.endsWith('.sol')) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Please upload a .sol file');
            }
        }
    };

    const runScan = async () => {
        if (!file) return;

        setScanning(true);
        setProgress(0);
        setError(null);

        try {
            const code = await file.text();

            // Progress animation
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return 90;
                    return prev + 5;
                });
            }, 1000);

            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contract_name: file.name,
                    code: code,
                }),
            });

            clearInterval(progressInterval);

            if (!response.ok) {
                throw new Error('Scan failed. Make sure the backend is running on localhost:5000');
            }

            const results = await response.json();
            setProgress(100);

            // Wait a moment then show results
            setTimeout(() => {
                setScanResults(results);
                setShowResults(true);
                setScanning(false);
            }, 500);

        } catch (err: any) {
            setError(err.message || 'Scan failed');
            setScanning(false);
        }
    };

    const handleBack = () => {
        setShowResults(false);
        setScanResults(null);
        setFile(null);
        setProgress(0);
    };

    // Show results page if scan complete
    if (showResults && scanResults) {
        return (
            <ResultsPageNew
                findings={scanResults.findings || []}
                originalCode={scanResults.original_code || ''}
                fixedCode={scanResults.fixed_code}
                fixesApplied={scanResults.fixes_applied || []}
                onBack={handleBack}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back to Home
                        </button>
                    )}
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Smart Contract Security Scanner
                    </h1>
                    <p className="text-xl text-zinc-400">
                        Upload your Solidity contract for comprehensive security analysis
                    </p>
                </div>

                {!file && !scanning && (
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-zinc-700 hover:border-blue-500/50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="w-16 h-16 mx-auto mb-4 text-zinc-400" />
                        <p className="text-xl text-zinc-300 mb-2">
                            Drag and drop your .sol file here
                        </p>
                        <p className="text-zinc-500 mb-6">or</p>
                        <label className="inline-block px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg cursor-pointer transition-colors">
                            Browse Files
                            <input
                                type="file"
                                accept=".sol"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                        </label>
                    </div>
                )}

                {file && !scanning && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <FileCode className="w-12 h-12 text-blue-500" />
                                <div>
                                    <h3 className="text-xl font-semibold text-white">{file.name}</h3>
                                    <p className="text-zinc-400">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setFile(null)}
                                className="text-zinc-400 hover:text-white transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <button
                            onClick={runScan}
                            className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Scan className="w-5 h-5" />
                            Deep Scan Contract
                        </button>
                    </div>
                )}

                {scanning && (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="text-center mb-8">
                            <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-500 animate-spin" />
                            <h3 className="text-2xl font-bold text-white mb-2">Scanning Contract</h3>
                            <p className="text-zinc-400">{SCAN_PHASES[0]}</p>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between text-sm text-zinc-400 mb-2">
                                <span>Progress</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2">
                                <div
                                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                        </div>

                        <div className="mt-8 grid grid-cols-1 gap-3">
                            <div className="p-3 rounded-lg border border-blue-500/50 bg-blue-500/10 text-blue-400 text-center">
                                <div className="text-xs font-medium leading-tight">{SCAN_PHASES[0]}</div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
}
