import { TSegmentsRouter } from '@server/domains/Segments';
import { createTRPCReact } from '@trpc/react-query';

const _segmentsService = createTRPCReact<TSegmentsRouter>();
export const segmentsService = _segmentsService.segments;

export const useGetSegmentTypes = () =>
  segmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
  });

export const useGetSegmentTypesEnabled = (enabled: boolean) =>
  segmentsService.getTypes.useQuery(undefined, {
    staleTime: 30000,
    enabled,
  });

export type TuseGetSegmentTypes = ReturnType<typeof useGetSegmentTypes>;

export const useCreateSegmentType = () =>
  segmentsService.createType.useMutation();

export const useUpdateSegmentType = () =>
  segmentsService.updateType.useMutation();

export const useDeleteSegmentType = () =>
  segmentsService.deleteType.useMutation();

export const useGetUserSegments = (input: { userId: number }) =>
  segmentsService.getUserSegments.useQuery(input);

export const useAssignSegmentToUser = () =>
  segmentsService.assignToUser.useMutation();

export const useRemoveSegmentFromUser = () =>
  segmentsService.removeFromUser.useMutation();

export const useGetUsersBySegments = (
  input: { segmentIds: number[] },
  options?: { enabled?: boolean },
) =>
  segmentsService.getBySegments.useQuery(input, {
    staleTime: 10000,
    ...options,
  });
