import { useCallback, useState, useEffect } from 'react'
import { API_BASE_URL, AUTH_USER_STORAGE_KEY } from '@/lib'

const i18n = {
  fr: {
    myProfile: 'Mon Profil',
    personalInfo: 'Informations Personnelles',
    fullName: 'Nom Complet',
    email: 'Email',
    createdAt: 'Compte créé le',
    changePassword: 'Changer le Mot de Passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    dangerZone: 'Zone Dangereuse',
    deleteAccount: 'Supprimer le Compte',
    deleteAccountWarning: 'Cette action est irréversible. Toutes vos données seront supprimées.',
    deleteAccountConfirm: 'Êtes-vous sûr? Tapez votre mot de passe pour confirmer.',
    deleteAccountButton: 'Supprimer mon Compte',
    logout: 'Se déconnecter',
    save: 'Enregistrer',
    cancel: 'Annuler',
    updating: 'Mise à jour...',
    deleting: 'Suppression...',
    passwordsDontMatch: 'Les mots de passe ne correspondent pas',
    profileUpdated: 'Profil mis à jour avec succès',
    accountDeleted: 'Compte supprimé avec succès',
    error: 'Une erreur est survenue',
    loading: 'Chargement...',
  },
  en: {
    myProfile: 'My Profile',
    personalInfo: 'Personal Information',
    fullName: 'Full Name',
    email: 'Email',
    createdAt: 'Account created on',
    changePassword: 'Change Password',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm password',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountWarning: 'This action is irreversible. All your data will be deleted.',
    deleteAccountConfirm: 'Are you sure? Enter your password to confirm.',
    deleteAccountButton: 'Delete My Account',
    logout: 'Log Out',
    save: 'Save',
    cancel: 'Cancel',
    updating: 'Updating...',
    deleting: 'Deleting...',
    passwordsDontMatch: 'Passwords do not match',
    profileUpdated: 'Profile updated successfully',
    accountDeleted: 'Account deleted successfully',
    error: 'An error occurred',
    loading: 'Loading...',
  },
}

export default function ProfilePage({ language = 'fr' }) {
  const t = i18n[language] || i18n.fr

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})

  // Form states
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [deletePassword, setDeletePassword] = useState('')

  const [updatingProfile, setUpdatingProfile] = useState(false)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/account/profile`, {
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      setFullName(data.fullName)
      setEmail(data.email)
    } catch (err) {
      console.error(err)
      setErrors({ main: t.error })
    } finally {
      setLoading(false)
    }
  }, [t.error])

  // Fetch profile on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile()
  }, [fetchProfile])

  const handleProfileUpdate = async (e) => {
    e.preventDefault()
    setErrors({})
    setUpdatingProfile(true)

    try {
      const updateData = {}
      if (fullName !== profile.fullName) updateData.fullName = fullName
      if (email !== profile.email) updateData.email = email

      const res = await fetch(`${API_BASE_URL}/account/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(updateData),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMap = {}
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            errorMap[err.field || 'main'] = err.message
          })
        }
        setErrors(errorMap)
        return
      }

      setProfile(data.user)
      setErrors({ success: t.profileUpdated })
    } catch {
      setErrors({ main: t.error })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setErrors({})

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: t.passwordsDontMatch })
      return
    }

    setUpdatingProfile(true)

    try {
      const res = await fetch(`${API_BASE_URL}/account/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMap = {}
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            errorMap[err.field || 'main'] = err.message
          })
        }
        setErrors(errorMap)
        return
      }

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setErrors({ success: t.profileUpdated })
    } catch {
      setErrors({ main: t.error })
    } finally {
      setUpdatingProfile(false)
    }
  }

  const handleDeleteAccount = async (e) => {
    e.preventDefault()
    setErrors({})

    if (!deletePassword) {
      setErrors({ deletePassword: 'Password required' })
      return
    }

    setDeletingAccount(true)

    try {
      const res = await fetch(`${API_BASE_URL}/account/profile`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password: deletePassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        const errorMap = {}
        if (data.errors && Array.isArray(data.errors)) {
          data.errors.forEach((err) => {
            errorMap[err.field || 'main'] = err.message
          })
        }
        setErrors(errorMap)
        return
      }

      localStorage.removeItem(AUTH_USER_STORAGE_KEY)
      localStorage.removeItem('token')
      window.location.href = '/'
    } catch {
      setErrors({ main: t.error })
    } finally {
      setDeletingAccount(false)
    }
  }

  if (loading) return <div className="text-center py-8">{t.loading}</div>

  return (
    <div className="min-h-screen bg-dark text-white py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">{t.myProfile}</h1>

        {errors.main && <div className="bg-red-500 text-white p-4 rounded mb-6">{errors.main}</div>}
        {errors.success && (
          <div className="bg-green-500 text-white p-4 rounded mb-6">{errors.success}</div>
        )}

        {/* Profile Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">{t.personalInfo}</h2>
          <form onSubmit={handleProfileUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.fullName}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
              {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            {profile && (
              <div className="text-sm text-gray-400 pt-4">
                {t.createdAt}: {new Date(profile.createdAt).toLocaleDateString(language)}
              </div>
            )}

            <button
              type="submit"
              disabled={updatingProfile}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-6 py-2 rounded font-medium mt-6"
            >
              {updatingProfile ? t.updating : t.save}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">{t.changePassword}</h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.currentPassword}</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
              {errors.currentPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.newPassword}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
              {errors.newPassword && <p className="text-red-400 text-sm mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t.confirmPassword}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              className="bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 px-6 py-2 rounded font-medium mt-6"
            >
              {updatingProfile ? t.updating : t.save}
            </button>
          </form>
        </div>

        {/* Delete Account */}
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-2 text-red-400">{t.dangerZone}</h2>
          <p className="text-gray-400 mb-4">{t.deleteAccountWarning}</p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-medium"
            >
              {t.deleteAccount}
            </button>
          ) : (
            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <p className="text-sm text-gray-300">{t.deleteAccountConfirm}</p>

              <div>
                <input
                  type="password"
                  placeholder={t.currentPassword}
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-4 py-2 text-white placeholder-gray-500"
                />
                {errors.password && <p className="text-red-400 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeletePassword('')
                  }}
                  className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-2 rounded font-medium"
                >
                  {deletingAccount ? t.deleting : t.deleteAccountButton}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
