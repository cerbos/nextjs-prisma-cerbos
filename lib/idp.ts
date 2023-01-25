/**
 * This `users` object represents what would be the identity provider in a production environment.
 */
export const users = [
  {
    username: "alice",
    password: "supersecret",
    role: "admin",
  },
  {
    username: "john",
    password: "password1234",
    role: "user",
  },
  {
    username: "sarah",
    password: "asdfghjkl",
    role: "user",
  },
  {
    username: "geri",
    password: "pwd123",
    role: "user",
  },
];

// Here you retrieve the user from your IdP
export async function findUser({ username }: { username: string }) {
  return users.find((user) => user.username === username);
}

// Compare the password of an already fetched user (using `findUser`) and compare the
// password for a potential match. We do a simple plain text comparison here for indicative purposes.
export function validatePassword(user: any, inputPassword: string) {
  const passwordsMatch = user.password === inputPassword;
  return passwordsMatch;
}
