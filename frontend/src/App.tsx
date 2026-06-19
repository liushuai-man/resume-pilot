import RouterProvider from '@/router/RouterProvider';
import { routes } from '@/router/routes';

export default function App() {
  return <RouterProvider routes={routes} />;
}
