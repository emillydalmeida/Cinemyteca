import '../styles/globals.css';
import { NotificacaoProvider } from '../components/NotificacaoProvider';

export default function App({ Component, pageProps }) {
  return (
    <NotificacaoProvider>
      <Component {...pageProps} />
    </NotificacaoProvider>
  );
}