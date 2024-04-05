export function createUser(userName) {
  return {
    user: userName,
    id: randomUUID(),
  };
}
