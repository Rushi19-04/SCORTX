import { useState } from 'react';
import { Download, Copy, Check, Code2, Shield, Sparkles } from 'lucide-react';

interface Finding {
    type: string;
    severity: string;
    title: string;
    description: string;
    line: number;
    recommendation: string;
}

interface FixApplied {
    severity: string;
    title: string;
    fix: string;
}

interface ResultsPageProps {
    findings: Finding[];
    originalCode: string;
    fixedCode: string | null;
    fixesApplied: FixApplied[];
    onBack: () => void;
}

type Tab = 'overview' | 'vulnerabilities' | 'remediation';

export default function ResultsPage({ findings, originalCode, fixedCode, fixesApplied, onBack }: ResultsPageProps) {
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [copiedOriginal, setCopiedOriginal] = useState(false);
    const [copiedFixed, setCopiedFixed] = useState(false);

    const highCount = findings.filter(f => f.severity === 'high' || f.severity === 'critical').length;
    const mediumCount = findings.filter(f => f.severity === 'medium').length;
    const lowCount = findings.filter(f => f.severity === 'low').length;

    const copyToClipboard = async (text: string, type: 'original' | 'fixed') => {
        await navigator.clipboard.writeText(text);
        if (type === 'original') {
            setCopiedOriginal(true);
            setTimeout(() => setCopiedOriginal(false), 2000);
        } else {
            setCopiedFixed(true);
            setTimeout(() => setCopiedFixed(false), 2000);
        }
    };

    const downloadCode = (code: string, filename: string) => {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
            case 'high':
                return 'text-red-400 bg-red-500/10 border-red-500/50';
            case 'medium':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50';
            case 'low':
                return 'text-blue-400 bg-blue-500/10 border-blue-500/50';
            default:
                return 'text-zinc-400 bg-zinc-500/10 border-zinc-500/50';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
            case 'high':
                return '🔴';
            case 'medium':
                return '🟡';
            case 'low':
                return '🔵';
            default:
                return '⚪';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Scan Results</h1>
                        <p className="text-zinc-400">Comprehensive security analysis completed</p>
                    </div>
                    <button
                        onClick={onBack}
                        className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
                    >
                        Scan Another Contract
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-zinc-800">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'overview'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-zinc-400 hover:text-zinc-300'
                            }`}
                    >
                        <Shield className="inline-block w-5 h-5 mr-2" />
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('vulnerabilities')}
                        className={`px-6 py-3 font-medium transition-colors ${activeTab === 'vulnerabilities'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-zinc-400 hover:text-zinc-300'
                            }`}
                    >
                        <Code2 className="inline-block w-5 h-5 mr-2" />
                        Vulnerabilities ({findings.length})
                    </button>
                    {fixedCode && (
                        <button
                            onClick={() => setActiveTab('remediation')}
                            className={`px-6 py-3 font-medium transition-colors ${activeTab === 'remediation'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-zinc-400 hover:text-zinc-300'
                                }`}
                        >
                            <Sparkles className="inline-block w-5 h-5 mr-2" />
                            AI Remediation
                        </button>
                    )}
                </div>

                {/* Tab Content */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-zinc-950 rounded-lg p-6 border border-zinc-800">
                                    <div className="text-4xl font-bold text-white mb-2">{findings.length}</div>
                                    <div className="text-zinc-400">Total Issues</div>
                                </div>
                                <div className="bg-red-500/10 rounded-lg p-6 border border-red-500/50">
                                    <div className="text-4xl font-bold text-red-400 mb-2">{highCount}</div>
                                    <div className="text-red-300">High Severity</div>
                                </div>
                                <div className="bg-yellow-500/10 rounded-lg p-6 border border-yellow-500/50">
                                    <div className="text-4xl font-bold text-yellow-400 mb-2">{mediumCount}</div>
                                    <div className="text-yellow-300">Medium Severity</div>
                                </div>
                                <div className="bg-blue-500/10 rounded-lg p-6 border border-blue-500/50">
                                    <div className="text-4xl font-bold text-blue-400 mb-2">{lowCount}</div>
                                    <div className="text-blue-300">Low Severity</div>
                                </div>
                            </div>

                            {findings.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-6xl mb-4">✅</div>
                                    <h3 className="text-2xl font-bold text-green-400 mb-2">No Vulnerabilities Found!</h3>
                                    <p className="text-zinc-400">This contract passed all security checks</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold text-white">Top Issues</h3>
                                    {findings.slice(0, 5).map((finding, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)}`}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{getSeverityIcon(finding.severity)}</span>
                                                    <span className="font-semibold uppercase text-sm">{finding.severity}</span>
                                                </div>
                                                <span className="text-sm text-zinc-400">Line {finding.line}</span>
                                            </div>
                                            <h4 className="font-bold text-white mb-2">{finding.title}</h4>
                                            <p className="text-sm text-zinc-300">{finding.description.substring(0, 200)}...</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Vulnerabilities Tab */}
                    {activeTab === 'vulnerabilities' && (
                        <div className="space-y-6">
                            {['high', 'critical', 'medium', 'low'].map(severity => {
                                const severityFindings = findings.filter(f => f.severity.toLowerCase() === severity);
                                if (severityFindings.length === 0) return null;

                                return (
                                    <div key={severity}>
                                        <h3 className="text-lg font-bold text-white mb-4 capitalize flex items-center gap-2">
                                            <span>{getSeverityIcon(severity)}</span>
                                            {severity} Severity ({severityFindings.length})
                                        </h3>
                                        <div className="space-y-3">
                                            {severityFindings.map((finding, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`p-5 rounded-lg border ${getSeverityColor(finding.severity)}`}
                                                >
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs font-bold uppercase px-2 py-1 rounded bg-zinc-950">
                                                                    {finding.severity}
                                                                </span>
                                                                <span className="text-xs text-zinc-400">Line {finding.line}</span>
                                                            </div>
                                                            <h4 className="font-bold text-white text-lg">{finding.title}</h4>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-3">
                                                        <div>
                                                            <p className="text-xs text-zinc-400 mb-1 font-semibold">Description:</p>
                                                            <p className="text-sm text-zinc-300 leading-relaxed">{finding.description}</p>
                                                        </div>

                                                        {finding.recommendation && (
                                                            <div className="bg-zinc-950 rounded-lg p-3 border border-zinc-800">
                                                                <p className="text-xs text-blue-400 mb-1 font-semibold">💡 Recommendation:</p>
                                                                <p className="text-sm text-zinc-300">{finding.recommendation}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Remediation Tab */}
                    {activeTab === 'remediation' && fixedCode && (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-lg p-6 border border-blue-500/50">
                                <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-blue-400" />
                                    AI-Generated Security Fixes
                                </h3>
                                <p className="text-zinc-300">
                                    Our AI has analyzed {fixesApplied.length} critical vulnerabilities and generated secure code fixes.
                                </p>
                            </div>

                            {/* Side-by-side code comparison */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Original Code */}
                                <div className="bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                                    <div className="bg-zinc-900 px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Original Code</h4>
                                        <button
                                            onClick={() => copyToClipboard(originalCode, 'original')}
                                            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            {copiedOriginal ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            {copiedOriginal ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                    <pre className="p-4 text-sm text-zinc-300 overflow-x-auto max-h-96 overflow-y-auto">
                                        <code>{originalCode}</code>
                                    </pre>
                                </div>

                                {/* Fixed Code */}
                                <div className="bg-zinc-950 rounded-lg border border-green-700 overflow-hidden">
                                    <div className="bg-green-900/30 px-4 py-3 border-b border-green-700 flex items-center justify-between">
                                        <h4 className="font-semibold text-white">Fixed Code ✨</h4>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => copyToClipboard(fixedCode, 'fixed')}
                                                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                {copiedFixed ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                                {copiedFixed ? 'Copied!' : 'Copy'}
                                            </button>
                                            <button
                                                onClick={() => downloadCode(fixedCode, 'fixed_contract.sol')}
                                                className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                            >
                                                <Download className="w-4 h-4" />
                                                Download
                                            </button>
                                        </div>
                                    </div>
                                    <pre className="p-4 text-sm text-green-300 overflow-x-auto max-h-96 overflow-y-auto">
                                        <code>{fixedCode}</code>
                                    </pre>
                                </div>
                            </div>

                            {/* Fixes Applied */}
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Fixes Applied</h3>
                                <div className="space-y-2">
                                    {fixesApplied.map((fix, idx) => (
                                        <div key={idx} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/50">
                                            <span className="text-green-400 text-xl">✅</span>
                                            <div>
                                                <p className="font-semibold text-white">{fix.title}</p>
                                                <p className="text-sm text-zinc-300">{fix.fix}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
