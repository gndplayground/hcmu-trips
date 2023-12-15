import {useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../utils/fetch';
import {Trip} from '../models/trip';

export function useGetHistory() {
  return useQuery({
    queryKey: ['history'],
    queryFn: async () => {
      const data = await axiosInstance.get<{data: Trip[]}>('/history/driver');

      return data.data.data;

      // let fakeData: Trip[] = [];
      // for (let i = 0; i <= 40; i++) {
      //   data.data.data.forEach(item => {
      //     fakeData.push({
      //       ...item,
      //       id: i + item.id + Math.random(),
      //     });
      //   });
      // }

      // return fakeData;
    },
    refetchInterval: 5000,
  });
}
