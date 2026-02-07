import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryProps {
  error: Error;
}

export default function ErrorBoundary({ error }: ErrorBoundaryProps) {
  const isSupabaseError = error.message.includes('Supabase');

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full bg-zinc-900 border border-zinc-800 rounded-lg p-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Configuration Error</h1>
            <p className="text-zinc-500">SCORTX failed to start</p>
          </div>
        </div>

        {isSupabaseError ? (
          <div className="space-y-4">
            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <h3 className="font-semibold text-zinc-100 mb-2">Supabase Not Configured</h3>
              <p className="text-sm text-zinc-400 mb-4">
                SCORTX requires Supabase for data storage. Please configure your environment
                variables.
              </p>
              <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
                <li>Copy <code className="text-blue-500">.env.example</code> to <code className="text-blue-500">.env</code></li>
                <li>Add your Supabase project URL and anon key</li>
                <li>Restart the development server</li>
              </ol>
            </div>

            <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-zinc-100 mb-2">Quick Setup:</h4>
              <pre className="text-xs text-zinc-400 bg-zinc-950 p-3 rounded border border-zinc-700 overflow-x-auto">
{`VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key`}
              </pre>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h3 className="font-semibold text-zinc-100 mb-2">Error Details</h3>
            <p className="text-sm text-red-400 font-mono">{error.message}</p>
          </div>
        )}
      </div>
    </div>
  );
}
