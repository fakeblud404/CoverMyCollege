import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function getAdminApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  // Allow build to pass without crash if correct firebase private key is not present
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'mock-project',
    });
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey || serviceAccountKey.includes('mockkey') || serviceAccountKey.includes('e30=')) {
    // Return mock app for sandbox demo
    return initializeApp({
      projectId: 'mock-project',
    });
  }

  let serviceAccount: ServiceAccount;
  try {
    const decoded = Buffer.from(serviceAccountKey, 'base64').toString('utf-8');
    serviceAccount = JSON.parse(decoded) as ServiceAccount;
    if (serviceAccount.projectId?.includes('mock')) {
      return initializeApp({ projectId: 'mock-project' });
    }
  } catch {
    try {
      serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;
      if (serviceAccount.projectId?.includes('mock')) {
        return initializeApp({ projectId: 'mock-project' });
      }
    } catch {
      return initializeApp({ projectId: 'mock-project' });
    }
  }

  try {
    return initializeApp({
      credential: cert(serviceAccount),
    });
  } catch {
    return initializeApp({
      projectId: 'mock-project',
    });
  }
}

const adminApp = getAdminApp();
const adminDb = getFirestore(adminApp);

export { adminApp, adminDb };
