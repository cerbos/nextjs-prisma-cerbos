/**
 * This `users` object represents what would be the identity provider in a production environment.
 */
const users = [
  {
    username: "alice",
    password: "supersecret",
  },
  {
    username: "john",
    password: "password1234",
  },
  {
    username: "sarah",
    password: "asdfghjkl",
  },
  {
    username: "geri",
    password: "pwd123",
  },
]

// Here you retrieve the user from your IdP
export async function findUser({ username }) {
  return users.find((user) => user.username === username)
}

// Compare the password of an already fetched user (using `findUser`) and compare the
// password for a potential match. We do a simple plain text comparison here for indicative purposes.
export function validatePassword(user, inputPassword) {
  const passwordsMatch = user.password === inputPassword
  return passwordsMatch
}
