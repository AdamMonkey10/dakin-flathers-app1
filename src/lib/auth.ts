import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

// Create default admin user if it doesn't exist
export const createDefaultUser = async () => {
  try {
    await createUserWithEmailAndPassword(auth, 'admin@dakinflathers.com', 'DakinAdmin123!');
    console.log('Default admin user created');
  } catch (error: any) {
    // Ignore if user already exists
    if (error.code !== 'auth/email-already-in-use') {
      console.error('Error creating default user:', error);
    }
  }
};