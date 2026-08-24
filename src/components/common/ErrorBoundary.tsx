import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { NeobrutalCard } from './NeobrutalCard';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('QURANVERSE Uncaught Runtime Exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[500px] flex items-center justify-center p-4">
          <NeobrutalCard className="p-8 max-w-lg w-full text-center space-y-5 bg-[#FFFDF7]">
            <div className="w-16 h-16 bg-[#FEE2E2] text-rose-700 rounded-3xl border-3 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center mx-auto animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-black">
                {this.props.fallbackTitle || 'Terjadi Sedikit Kendala Teknis'}
              </h2>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                Aplikasi telah mengisolasi error ini agar tidak mengganggu data hafalan Anda. Silakan klik tombol di bawah untuk memuat ulang sistem secara aman.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-gray-100 border-2 border-black rounded-xl text-left font-mono text-[11px] text-gray-800 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-[#0B4627] hover:bg-[#06331b] text-white text-xs font-black rounded-xl border-2 border-black neo-button cursor-pointer flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_#000]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Muat Ulang Halaman</span>
              </button>
            </div>
          </NeobrutalCard>
        </div>
      );
    }

    return this.props.children;
  }
}
