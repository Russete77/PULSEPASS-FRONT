import { useEffect, useState } from 'react';
import { api } from './api';

export type ActiveEvent = { id: string; slug: string; title: string };

/**
 * Resolve o "evento ativo" do app (1o publicado) para escopar a carteira
 * cashless e o bar ao mesmo evento. No produto real isso vem do check-in /
 * geolocalizacao; aqui simplificamos para o slice.
 */
export function useActiveEvent() {
  const [event, setEvent] = useState<ActiveEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .listEvents()
      .then((list: ActiveEvent[]) => {
        setEvent(list?.[0] ?? null);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  return { event, loading, error };
}
