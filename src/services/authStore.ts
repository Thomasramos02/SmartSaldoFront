let accessToken: string | null = null;

export const authStore = {
  set(token: string) {
    accessToken = token;
  },
  get() {
    return accessToken;
  },
  clear() {
    accessToken = null;
  },
};
