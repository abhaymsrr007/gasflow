import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';

export function useCustomers(page = 1, search = '') {
  return useQuery({
    queryKey: ['customers', page, search],
    queryFn: async () => {
      const res = await apiClient(`/customers?page=${page}&limit=10&search=${search}`);
      return res.data; // Backend se { data: [], meta: {} } aata hai
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newCustomer: any) => {
      const res = await apiClient('/customers', {
        method: 'POST',
        body: JSON.stringify(newCustomer),
      });
      return res.data;
    },
    onSuccess: () => {
      // Jab naya customer bane, toh list refresh karo
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
}