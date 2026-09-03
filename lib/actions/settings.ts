'use server'

import { fetchAPI } from '@/lib/api'

export async function updateProfile(data: { displayName: string; bio: string; website: string; email: string }) {
  try {
    const response = await fetchAPI('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}

export async function updateSecurity(data: { currentPass: string; newPass: string }) {
  try {
    const response = await fetchAPI('/api/users/security', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return { success: true, data: response };
  } catch (error) {
    console.error('Error updating security:', error);
    return { success: false, message: 'Failed to update security' };
  }
}
