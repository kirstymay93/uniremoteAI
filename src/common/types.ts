export type DeviceType = 'roku' | 'firetv' | 'androidtv' | 'samsung' | 'lg' | 'chromecast' | 'dlna';

export interface DeviceInfo {
  id: string;
  name: string;
  type: DeviceType;
  host?: string;
  port?: number;
  profile?: string;
  lastSeen?: number;
  metadata?: Record<string, any>;
}

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}
