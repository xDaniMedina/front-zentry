import { getWalletBalance } from "@/lib/actions/wallet";
import WalletClient, { WalletData } from "./WalletClient";

export default async function WalletPage() {
  const res = await getWalletBalance();

  const initialData: WalletData | null = res.success
    ? {
        balance: res.coins ?? 0,
        activePlanId: res.planId ?? 'free',
        nextBillingDate: res.nextBillingDate ?? '—',
        transactions: res.transactions ?? [],
      }
    : null;

  return <WalletClient initialData={initialData} />;
}
