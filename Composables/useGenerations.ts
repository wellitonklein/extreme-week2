import type { Generation } from '@/entities/Generation';

export const useGenerations = () => {
  const loading = ref<boolean>(true);
  const generations = ref<Generation[]>([]);

  const fetchGenerations = async () => {
    try {
      const response = await $fetch<Generation[]>('/api/generations');
      generations.value = response;
    } catch (error) {
      console.error(error);
    } finally {
      loading.value = false;
    }
  };

  const isEmpty = computed(() => generations.value.length === 0);

  onMounted(() => {
    fetchGenerations();
  });

  return {
    loading,
    isEmpty,
    generations,
    refetch: fetchGenerations,
  };
};
