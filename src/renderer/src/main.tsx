import './assets/main.css'

// Polyfill process.env for browser safe execution
if (typeof window !== 'undefined') {
  if (!(window as any).process) {
    (window as any).process = { env: {} };
  }
}

// Define global safe mock for window.electron to prevent crashes in standalone browser mode
if (typeof window !== 'undefined' && !(window as any).electron) {
  (window as any).electron = {
    ipcRenderer: {
      invoke: async (channel: string, ...args: any[]) => {
        console.warn(`[Browser Mode IPC mock] invoke channel: ${channel}`, args);
        
        // 🌐 Hybrid Bridge: Route Chrome browser queries to Electron's native command bridge on localhost
        try {
          const response = await fetch('http://localhost:49150/api/ipc', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ channel, args })
          });
          if (response.ok) {
            const payload = await response.json();
            if (payload.success) {
              return payload.data;
            }
          }
        } catch (e) {
          // Local bridge offline; fall back cleanly to sandbox simulations
        }
        if (channel === 'check-vault-status') {
          const hasPin = localStorage.getItem('iris_local_pin') !== null;
          const hasFace = localStorage.getItem('iris_local_face') !== null;
          return { hasPin, hasFace, faceCount: hasFace ? 1 : 0 };
        }
        if (channel === 'verify-vault-pin') {
          const storedPin = localStorage.getItem('iris_local_pin') || '1705';
          return args[0] === storedPin;
        }
        if (channel === 'setup-vault-pin') {
          localStorage.setItem('iris_local_pin', args[0]);
          return true;
        }
        if (channel === 'setup-vault-face') {
          localStorage.setItem('iris_local_face', JSON.stringify(args[0]));
          return true;
        }
        if (channel === 'get-personality') {
          return localStorage.getItem('iris_personality_matrix') || '';
        }
        if (channel === 'get-app-version') {
          return '1.3.0 (Web Sandbox)';
        }
        if (channel === 'get-notes') {
          try {
            const notes = localStorage.getItem('iris_notes');
            return notes ? JSON.parse(notes) : [];
          } catch(e) { return []; }
        }
        if (channel === 'save-note') {
          try {
            const notesStr = localStorage.getItem('iris_notes') || '[]';
            const notes = JSON.parse(notesStr);
            notes.push(args[0]);
            localStorage.setItem('iris_notes', JSON.stringify(notes));
          } catch(e) {}
          return true;
        }
        if (channel === 'delete-note') {
          try {
            const notesStr = localStorage.getItem('iris_notes') || '[]';
            let notes = JSON.parse(notesStr);
            notes = notes.filter((n: any) => n.title !== args[0] && n.filename !== args[0]);
            localStorage.setItem('iris_notes', JSON.stringify(notes));
            return true;
          } catch(e) {
            return false;
          }
        }
        if (channel === 'get-gallery') {
          return [];
        }
        if (channel === 'delete-image') {
          return true;
        }
        if (channel === 'adb-get-history') {
          return [];
        }
        if (channel === 'adb-telemetry') {
          return null;
        }
        if (channel === 'add-message') {
          try {
            const historyStr = localStorage.getItem('iris_chat_history') || '[]';
            let history = JSON.parse(historyStr);
            history.push(args[0]);
            if (history.length > 20) history = history.slice(-20);
            localStorage.setItem('iris_chat_history', JSON.stringify(history));
            return true;
          } catch(e) {
            return false;
          }
        }
        if (channel === 'get-history') {
          try {
            const historyStr = localStorage.getItem('iris_chat_history') || '[]';
            return JSON.parse(historyStr);
          } catch(e) {
            return [];
          }
        }
        // Simulated handlers for standalone browser sandbox mode
        if (channel === 'open-app') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Opened application "${args[0]}"` };
        }
        if (channel === 'close-app') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Closed application "${args[0]}"` };
        }
        if (channel === 'google-search') {
          window.open(`https://www.google.com/search?q=${encodeURIComponent(args[0])}`, '_blank');
          return { success: true };
        }
        if (channel === 'read-directory') {
          return [
            { name: 'src', isDirectory: true, size: 0 },
            { name: 'package.json', isDirectory: false, size: 3650 },
            { name: 'README.md', isDirectory: false, size: 14368 },
            { name: 'env.example', isDirectory: false, size: 71 }
          ];
        }
        if (channel === 'create-folder' || channel === 'create-directory') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Folder structure path "${args[0]?.path || args[0]}" successfully created.` };
        }
        if (channel === 'write-file') {
          return { success: true, output: `[SANDBOX SIMULATOR]: File "${args[0]?.fileName || args[0]}" written to disk.` };
        }
        if (channel === 'read-file') {
          return `// [SANDBOX SIMULATOR]: Simulated file content\nconsole.log("Hello, Bhuvan!");`;
        }
        if (channel === 'open-file' || channel === 'file:open') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Opened local file: "${args[0]}"` };
        }
        if (channel === 'manage-file' || channel === 'file-ops') {
          return { success: true, output: `[SANDBOX SIMULATOR]: File operation "${args[0]?.operation || args[0]}" executed.` };
        }
        if (channel === 'run-terminal' || channel === 'run-shell-command') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Executed CLI script: "${args[0]?.command || args[0]}"\nSuccess: Command execution compiled cleanly with code 0.` };
        }
        if (channel === 'open-project' || channel === 'open-in-vscode') {
          return { success: true, output: `[SANDBOX SIMULATOR]: Loaded workspace in IDE: "${args[0]}"` };
        }
        if (channel === 'take-screenshot') {
          return { success: true, data: '', message: '[SANDBOX SIMULATOR]: Captured mock screen view successfully.' };
        }
        if (channel === 'set-volume') {
          return { success: true, level: args[0], message: `[SANDBOX SIMULATOR]: Set sound volume to ${args[0]}%` };
        }
        if (channel === 'get-screen-size') {
          return { width: window.innerWidth || 1920, height: window.innerHeight || 1080 };
        }
        if (channel === 'ghost-click-coordinate') {
          console.log(`[SANDBOX SIMULATOR]: Clicking coordinate at x: ${args[0]?.x}, y: ${args[0]?.y}`);
          return true;
        }
        if (channel === 'ghost-scroll') {
          console.log(`[SANDBOX SIMULATOR]: Scrolling screen ${args[0]?.direction} by ${args[0]?.amount || 500}px`);
          return true;
        }
        if (channel === 'ghost-sequence') {
          console.log('[SANDBOX SIMULATOR]: Executing action macro sequence: ', args[0]);
          return true;
        }
        if (channel === 'teleport-windows') {
          return { success: true };
        }
        if (channel === 'create-widget') {
          return { success: true, id: 'simulated-widget' };
        }
        if (channel === 'close-widgets') {
          return { success: true };
        }
        if (channel === 'save-core-memory') {
          return true;
        }
        if (channel === 'search-core-memory') {
          return [{ fact: "Operator Bhuvan is running IRIS on standard browser sandbox layer." }];
        }
        if (channel === 'deploy-wormhole') {
          return { success: true, url: 'https://iris-wormhole-simulated.locallink' };
        }
        if (channel === 'close-wormhole') {
          return { success: true };
        }
        return null;
      },
      send: (channel: string, ...args: any[]) => {
        console.warn(`[Browser Mode IPC mock] send channel: ${channel}`, args);
      },
      on: (channel: string, listener: any) => {
        console.warn(`[Browser Mode IPC mock] on channel: ${channel}`);
        return () => {};
      },
      removeAllListeners: (channel: string) => {
        console.warn(`[Browser Mode IPC mock] removeAllListeners channel: ${channel}`);
      }
    }
  };

  // Seeding credentials on boot in browser sandbox mode
  const gemini = process.env.GEMINI_API_KEY || '';
  const groq = process.env.GROQ_API_KEY || '';
  const tavily = process.env.TAVILY_API_KEY || '';
  const pin = process.env.LOCAL_PIN || '1705';

  if (gemini) {
    localStorage.setItem('iris_custom_api_key', gemini);
  }
  if (groq) {
    localStorage.setItem('iris_groq_api_key', groq);
  }
  if (tavily) {
    localStorage.setItem('iris_tailvy_api_key', tavily);
  }
  if (pin) {
    localStorage.setItem('iris_local_pin', pin);
  }
}

import React, { JSX, StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'

import LockScreen from './UI/LockScreen'
import LoginPage from './auth/Login'
import { useAuthStore } from './store/auth-store'
import AxiosInstance from './config/AxiosInstance'
import AuthInitializer from './auth/AuthToken'
import IndexRoot from './IndexRoot'

const electronAPI = (window as any).electron?.ipcRenderer

class SystemErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false, errorMsg: '' }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center text-red-500 font-mono p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">CRITICAL SYSTEM FAILURE</h1>
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded text-xs text-red-300 max-w-2xl wrap-break-word">
            {this.state.errorMsg}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

let isSessionUnlocked = false

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const [status, setStatus] = useState<'checking' | 'authorized'>('checking')
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const verifyAccess = async () => {
      // Standalone local-first operation: bypass cloud auth
      if (!isSessionUnlocked && location.pathname !== '/lock') {
        navigate('/lock', { replace: true })
        return
      }
      setStatus('authorized')
    }

    verifyAccess()
  }, [navigate, location.pathname])

  if (status === 'checking') {
    return (
      <div className="h-screen w-screen bg-[#050505] flex items-center justify-center text-[#10b981] font-mono text-sm tracking-widest uppercase">
        Verifying Security Clearance...
      </div>
    )
  }

  return children
}

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  // Always bypass login screen in local standalone mode
  return <Navigate to="/" replace />
}

const AppRouter = () => {
  const navigate = useNavigate()

  useEffect(() => {
    if (electronAPI) {
      electronAPI.on('oauth-callback', (_event: any, url: string) => {
        try {
          const urlObj = new URL(url.replace('iris://', 'http://localhost/'))

          const refreshToken = urlObj.searchParams.get('refreshToken')
          const accessToken = urlObj.searchParams.get('accessToken')

          if (refreshToken && accessToken) {
            localStorage.setItem('iris_cloud_token', refreshToken)
            useAuthStore.getState().setAccessToken(accessToken)

            navigate('/')
          }
        } catch (e) {
        }
      })
    }
    return () => electronAPI?.removeAllListeners('oauth-callback')
  }, [navigate])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />


      <Route
        path="/lock"
        element={
          <ProtectedRoute>
            <LockScreen
              onUnlock={() => {
                isSessionUnlocked = true
                navigate('/')
              }}
            />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <IndexRoot />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SystemErrorBoundary>
      <HashRouter>
        <AuthInitializer />
        <AppRouter />
      </HashRouter>
    </SystemErrorBoundary>
  </StrictMode>
)
