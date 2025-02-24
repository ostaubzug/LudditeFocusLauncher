import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: "com.luddite.ludditelauncher",
  appName: "LudditeLauncher",
  webDir: "dist/luddite-launcher/browser",
  server: {
    androidScheme: "http"
  },
  plugins: {
    CapacitorHttp: {
      enabled: true
    }
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
