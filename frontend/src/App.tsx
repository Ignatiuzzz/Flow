import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-white text-slate-900 shadow-lg rounded-xl border border-slate-100',
          duration: 4000,
          style: {
            padding: '16px',
            color: '#0f172a',
            fontFamily: 'Inter, Manrope, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'white',
            },
          },
        }}
      />
      <AppRouter />
    </>
  );
}

export default App;