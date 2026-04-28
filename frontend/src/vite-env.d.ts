/// <reference types="vite/client" />

declare global {
  interface Window {
    _AMapSecurityConfig?: {
      securityJsCode: string;
    };
  }

  const Loca: {
    Container: new (options: any) => any;
    LineLayer: new (options: any) => any;
    GeoJSONSource: new (options: any) => any;
  };

  namespace Loca {
    type Container = any;
    type LineLayer = any;
  }
}

export {};
