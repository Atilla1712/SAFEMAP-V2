import React, { ReactNode } from "react";
import { Shield, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught SafeMap error:", error, errorInfo);
  }

  handleReset = () => {
    try {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (e) {
      console.warn("Reload failed:", e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1B2620] text-[#F0EEE8] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#202C26] border border-[#7FA396]/30 flex items-center justify-center text-[#7FA396] mb-4 shadow-xl">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold font-display text-[#F0EEE8] mb-2">SafeMap</h1>
          <p className="text-xs text-[#B8C2BC] max-w-sm mb-6 leading-relaxed">
            Terjadi kendala saat memuat halaman pada perangkat Anda. Silakan muat ulang aplikasi.
          </p>
          <button
            onClick={this.handleReset}
            className="px-5 py-2.5 bg-[#7FA396] hover:bg-[#9DBDB0] text-[#1B2620] font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Muat Ulang / Reload</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
