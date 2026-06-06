import { Redirect } from 'expo-router';

/**
 * ROTA RAIZ (Index)
<<<<<<< HEAD
 * Redireciona automaticamente o usuário para a tela de welcome ou para o dashboard.
 * A lógica de proteção de rotas no _layout.tsx cuidará do destino final baseado no login.
 */
export default function Index() {
  return null;
=======
 * Redireciona automaticamente o usuário para a tela de boas-vindas ou para o dashboard.
 * A lógica de proteção de rotas no _layout.tsx cuidará do destino final baseado no login.
 */
export default function Index() {
  return <Redirect href="/welcome" />;
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
}
