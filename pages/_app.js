import '../styles/globals.css';
import { NotificacaoProvider } from '../components/NotificacaoProvider';
import { AuthProvider } from '../components/AuthProvider';

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificacaoProvider>
        <Component {...pageProps} />
      </NotificacaoProvider>
    </AuthProvider>
  );
}