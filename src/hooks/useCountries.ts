import { countries } from '@/data/countries';
import { Country } from '@/types/quiz';

// Local, synchronous country source to avoid Supabase dependency.
export const useCountries = () => ({
  data: countries as Country[],
  isLoading: false,
  error: null as unknown,
});
