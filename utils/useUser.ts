import { useEffect, useState } from 'react'
//import { prisma } from '../lib/prisma';

export function useUser() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    try {
      const user = prisma.user.findUnique({
        where: { username: 'alice' },
      });
      if (!user) {
        throw Error("Not found");
      }
      setUser(user)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  })

  return { user, loading, error }
}
