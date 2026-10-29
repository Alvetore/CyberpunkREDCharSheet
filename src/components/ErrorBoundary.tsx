import React, { Component, ErrorInfo, ReactNode } from 'react';
import { exportStorageRecovery } from '../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in Cyberpunk RED Character Sheet:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4 font-mono">
          <div className="max-w-xl w-full bg-zinc-900 border-2 border-red-600 rounded-lg p-6 shadow-2xl shadow-red-950 space-y-4">
            <div className="flex items-center gap-2 text-red-500 font-bold text-lg uppercase tracking-wider font-orbitron">
              <span>⚠</span>
              <span>Критический сбой интерфейса / System Crash</span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Произошла непредвиденная ошибка отображения. Ваши сохранённые данные в браузере в безопасности.
              Вы можете выгрузить резервную копию персонажей или перезагрузить страницу.
            </p>
            {this.state.error && (
              <div className="bg-black/80 border border-zinc-800 rounded p-3 text-xs text-red-400 overflow-x-auto max-h-40 font-mono">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition"
              >
                Перезагрузить страницу
              </button>
              <button
                type="button"
                onClick={exportStorageRecovery}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs uppercase tracking-wider rounded border border-zinc-700 transition"
              >
                Выгрузить резервную копию
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
