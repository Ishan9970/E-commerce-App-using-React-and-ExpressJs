import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext';

export const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const { token, userId } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);

  const refreshProfile = useCallback(() => {
    if (!token || !userId) {
      setProfile(null);
      return Promise.resolve(null);
    }
    return fetch(`http://localhost:3000/user/${encodeURIComponent(userId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(user => { setProfile(user); return user; })
      .catch(() => { setProfile(null); return null; });
  }, [token, userId]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const value = useMemo(() => ({ profile, setProfile, refreshProfile }), [profile, refreshProfile]);

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}
