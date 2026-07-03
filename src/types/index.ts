export type Dashboard = {
  id: string;
  name: string;
  url: string;
  duration: number;
  order: number;
  active: boolean;
};

export type DisplayConfig = {
  id: string;
  resolution: string;
  zoom: number;
  fallbackImageUrl: string | null;
  refreshInterval: number;
};

export type DisplayState = {
  version: number;
  dashboards: Dashboard[];
  config: DisplayConfig;
};
