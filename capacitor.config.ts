import type { CapacitorConfig } from '@capacitor/cli';

// Set this to the explicit App ID registered for Spring Trials in Apple Developer.
const appId = process.env.SPRING_TRIALS_BUNDLE_ID;
if (!appId) throw new Error('Set SPRING_TRIALS_BUNDLE_ID to the registered Apple bundle identifier.');

const config: CapacitorConfig = {
  appId,
  appName: 'Spring Trials',
  webDir: 'www',
  backgroundColor: '#1d1830',
  ios: { contentInset: 'never', backgroundColor: '#1d1830', scrollEnabled: false },
};
export default config;
