import { Shield, Zap, BarChart3, ArrowRight } from 'lucide-react';

interface LandingProps {
  onGetStarted: () => void;
}

export default function Landing({ onGetStarted }: LandingProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="pt-12 pb-8 border-b border-zinc-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Shield className="w-6 h-6 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold">
              <span className="text-blue-500">SCORTX</span>
            </h1>
          </div>
          <p className="text-zinc-400 max-w-md">Smart Contract X-Ray Analysis</p>
        </div>

        {/* Hero Section */}
        <div className="py-20 space-y-12">
          <div className="max-w-3xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Scan Your Smart Contracts for Security Vulnerabilities
            </h2>
            <p className="text-xl text-zinc-400 mb-8">
              Upload your Solidity contract. Get instant analysis of vulnerabilities, severity ratings, and AI-powered remediation suggestions in seconds.
            </p>
            <button
              onClick={onGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition-colors"
            >
              Start Scanning
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="p-3 bg-blue-500/10 rounded-lg w-fit mb-4">
                <Zap className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-bold mb-2">Instant Analysis</h3>
              <p className="text-sm text-zinc-400">
                Powered by Mythril and Slither to detect vulnerabilities in seconds
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="p-3 bg-green-500/10 rounded-lg w-fit mb-4">
                <Shield className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="font-bold mb-2">Detailed Findings</h3>
              <p className="text-sm text-zinc-400">
                Severity levels, descriptions, and line-by-line vulnerability identification
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <div className="p-3 bg-cyan-500/10 rounded-lg w-fit mb-4">
                <BarChart3 className="w-6 h-6 text-cyan-500" />
              </div>
              <h3 className="font-bold mb-2">AI Remediation</h3>
              <p className="text-sm text-zinc-400">
                Get automatically patched code with security best practices applied
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 mt-16">
            <h3 className="text-2xl font-bold mb-8">How It Works</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                  1
                </div>
                <h4 className="font-semibold">Upload Contract</h4>
                <p className="text-sm text-zinc-400">Drag and drop your .sol file or click to select</p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                  2
                </div>
                <h4 className="font-semibold">Deep Scan</h4>
                <p className="text-sm text-zinc-400">System analyzes bytecode and executes symbolic execution</p>
              </div>
              <div className="space-y-3">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                  3
                </div>
                <h4 className="font-semibold">View Results</h4>
                <p className="text-sm text-zinc-400">Review vulnerabilities and AI-patched remediation code</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="py-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
          <p>Secure your smart contracts before deployment</p>
        </div>
      </div>
    </div>
  );
}
