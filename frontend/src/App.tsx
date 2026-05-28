import AppRouter from "./router/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'bg-white/95 backdrop-blur-xl text-slate-900 shadow-premium rounded-2xl border border-slate-200/60 font-semibold tracking-tight !px-5 !py-4',
          duration: 4000,
          style: {
            color: '#0f172a',
            fontFamily: 'Inter, Manrope, sans-serif'
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626', 
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