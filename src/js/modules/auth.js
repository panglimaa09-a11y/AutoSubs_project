import { register, login, logout } from '../services/auth.js';

export async function handleLogin(email, password) {
  return await login(email, password);
}

export async function handleRegister(email, password) {
  return await register(email, password);
}

export async function handleLogout() {
  return await logout();
}
