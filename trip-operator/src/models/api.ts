export interface APIResponse<T, M = unknown> {
  data: T;
  meta?: M;
}
