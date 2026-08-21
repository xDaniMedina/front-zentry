import { fetchAPI } from "@/lib/api";
import WalletClient from "./WalletClient";

export default async function WalletPage() {
  let walletData = null;

  try {
    walletData = await fetchAPI('/api/core/wallet');
  } catch (error) {
    console.error("El backend no está disponible para la Billetera:", error);
  }

  return <WalletClient initialData={walletData} />;
}

