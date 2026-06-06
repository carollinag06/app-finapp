import { Redirect } from 'expo-router';

/**
 * ROTA RAIZ (Index)
 * Redireciona automaticamente o usuário para a tela de boas-vindas ou para o dashboard.
 * A lógica de proteção de rotas no _layout.tsx cuidará do destino final baseado no login.
 */
export default function Index() {
  return <Redirect href="/welcome" />;
}
