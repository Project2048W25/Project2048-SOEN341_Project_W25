import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'
import { createProfile } from '../services/profileService'

const GoogleCallback = () => {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Verifying your Google login...')

  useEffect(() => {
    const verifyOAuth = async () => {
      try {
        // 1. Check user session
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) {
          console.error('Error retrieving session:', error)
          setStatus('Failed to retrieve session.')
          return
        }

        if (!session) {
          setStatus('No active session found.')
          return
        }

        const { user } = session
        console.log('OAuth user:', user)

        // 2. Check if user has a profile row
        //    (Here, we store "password" in profile for email-based users,
        //     but an OAuth user will not have a password.)
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.log('Profile not found. We may need to create it.')
        }

        // If there's no profile row, create one
        if (!existingProfile) {
          setStatus('Creating profile for new user...')

          // Use your createProfile() function
          const { data: newProfile, error: createError } = await createProfile({
            id: user.id,
            username: user.user_metadata?.username || user.email.split('@')[0],
            password: 'temporary', // no raw password for OAuth
            role: 'Member', // or "Admin" if you like
            email: user.email,
          })

          if (createError) {
            console.error('Failed to create profile:', createError)
            setStatus('Profile creation failed.')
            return
          }
          console.log('Profile created for OAuth user:', newProfile)
        }

        // 3. Redirect the user to your main app or dashboard
        setStatus('Redirecting to the app...')
        navigate('/app') // or wherever you want
      } catch (err) {
        console.error('Unexpected error:', err)
        setStatus('Something went wrong.')
      }
    }

    verifyOAuth()
  }, [navigate])

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>Google Callback</h2>
      <p>{status}</p>
    </div>
  )
}

export default GoogleCallback
