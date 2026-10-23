export interface BusinessEvent {
  id: string;
  title: string;
  type: string;
  country: string;
  city: string;
  startsAt: string;
  summary: string;
  image: string;
  illustrative?: boolean;
}
