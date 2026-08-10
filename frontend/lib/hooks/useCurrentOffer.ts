import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface ActiveOffer {
  code: string;
  name: string;
  discount_value_inr: number;
  expires_at: string;
  server_time: string;
}

export function useCurrentOffer() {
  return useQuery({
    queryKey: ['currentOffer'],
    queryFn: async () => {
      const res = await api.get('/subscriptions/current-offer/');
      return res.data.active_offer as ActiveOffer | null;
    },
    refetchInterval: 60000, // Refetch every minute to check if expired
  });
}
