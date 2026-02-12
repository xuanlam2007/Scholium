'use server'

import { getSession } from '@/lib/auth'
import { sql } from '@/lib/db'
import { hashPassword, verifyPassword } from '@/lib/auth'

/**
 * Update user profile
 */
export async function updateUserProfile({
  name,
  profilePictureUrl,
}: {
  name?: string
  profilePictureUrl?: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSession()
    if (!user) return { success: false, error: 'Not authenticated' }

    const updates: string[] = []
    const values: any[] = []
    let paramCount = 1

    if (name) {
      updates.push(`name = $${paramCount}`)
      values.push(name)
      paramCount++
    }

    if (profilePictureUrl) {
      updates.push(`profile_picture_url = $${paramCount}`)
      values.push(profilePictureUrl)
      paramCount++
    }

    if (updates.length === 0) return { success: true }

    values.push(user.id)
    const updateQuery = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id`

    await sql(updateQuery as any, ...values)
    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

/**
 * Change password
 */
export async function changePassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSession()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Get current password hash
    const result = await sql`
      SELECT password_hash FROM users WHERE id = ${user.id}
    `

    if (result.length === 0) {
      return { success: false, error: 'User not found' }
    }

    const currentHash = result[0].password_hash as string

    // Verify current password
    const isValid = await verifyPassword(currentPassword, currentHash)
    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' }
    }

    // Hash new password
    const newHash = await hashPassword(newPassword)

    // Update password
    await sql`
      UPDATE users SET password_hash = ${newHash}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
    `

    return { success: true }
  } catch (error) {
    console.error('[v0] Error changing password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

/**
 * Send password reset email (for email verification)
 */
export async function sendPasswordResetEmail(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getSession()
    if (!user) return { success: false, error: 'Not authenticated' }

    // In a real app, you would send an email here
    // For now, we'll just simulate it and mark email as verified
    const result = await sql`
      UPDATE users SET email_verified = true, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${user.id}
      RETURNING id
    `

    if (result.length === 0) {
      return { success: false, error: 'User not found' }
    }

    // TODO: Implement actual email sending with verification code
    console.log(`[v0] Email verification would be sent to ${email}`)

    return { success: true }
  } catch (error) {
    console.error('[v0] Error sending verification email:', error)
    return { success: false, error: 'Failed to send email' }
  }
}
