'use server'

import { fetchAPI, ApiError } from '@/lib/api'
import { revalidatePath } from 'next/cache'

export async function updateProfile(data: { displayName: string; bio: string; website: string; email: string }) {
  try {
    const response = await fetchAPI('/api/core/profiles/me', {
      method: 'PUT',
      body: JSON.stringify({ name: data.displayName, bio: data.bio }),
    });
    if (!response) {
      return { success: false, message: 'No se pudo actualizar el perfil' };
    }
    revalidatePath('/profile/[username]', 'page');
    return { success: true, data: response };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { success: false, message: 'Failed to update profile' };
  }
}

export async function updateSecurity(data: { currentPass: string; newPass: string }) {
  try {
    const response = await fetchAPI('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword: data.currentPass, newPassword: data.newPass }),
    });
    if (!response) {
      return { success: false, message: 'No se pudo actualizar la contraseña' };
    }
    return { success: true, data: response };
  } catch (error) {
    const message = error instanceof ApiError ? error.message : 'Failed to update security';
    console.error('Error updating security:', error);
    return { success: false, message };
  }
}

export type PrivacySettings = {
  isPrivate: boolean;
  showSavedPosts: boolean;
  showLikedPosts: boolean;
};

export async function updatePrivacySettings(data: PrivacySettings) {
  try {
    const response = await fetchAPI('/api/core/profiles/me', {
      method: 'PUT',
      body: JSON.stringify({
        is_private: data.isPrivate,
        show_saved_posts: data.showSavedPosts,
        show_liked_posts: data.showLikedPosts,
      }),
    });
    if (!response) {
      return { success: false, message: 'No se pudo actualizar la privacidad' };
    }
    revalidatePath('/profile/[username]', 'page');
    return { success: true, data: response };
  } catch (error) {
    console.error('Error updating privacy settings:', error);
    return { success: false, message: 'Failed to update privacy settings' };
  }
}
