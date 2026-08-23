import { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Tienda Zentry | Personalización & Recompensas ZC',
  description: 'Canjea tus Zentry Coins por marcos de avatar, temas exclusivos, mascotas de compañía y fondos de perfil.'
};

export default function ShopPage() {
  return <ShopClient />;
}
