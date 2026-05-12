import axios from 'axios';
import type { Topic, CreateTopicDto, CreateCommentDto } from '../types/forum.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3000',
});

// Obtener todos los topics
export const getAllTopics = () =>
  api.get<Topic[]>('/forum/topics').then(r => r.data);

// Obtener un topic por ID
export const getTopicById = (id: string) =>
  api.get<Topic>(`/forum/topics/${id}`).then(r => r.data);

// Crear un topic
export const createTopic = (data: CreateTopicDto, image?: File) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  formData.append('author', data.author);
  if (image) formData.append('image', image);

  return api.post<Topic>('/forum/topics', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

// Eliminar un topic (solo admin)
export const deleteTopic = (id: string) =>
  api.delete(`/forum/topics/${id}`, { data: { isAdmin: true } });

// Agregar comentario
export const addComment = (topicId: string, data: CreateCommentDto) =>
  api.post(`/forum/topics/${topicId}/comments`, data).then(r => r.data);

// Dar o quitar like
export const toggleLike = (topicId: string, username: string) =>
  api.post(`/forum/topics/${topicId}/like`, { username }).then(r => r.data);

// Obtener likes de un topic
export const getLikes = (topicId: string, username: string) =>
  api.get(`/forum/topics/${topicId}/likes?username=${username}`).then(r => r.data);

// Obtener usuarios bloqueados
export const getBlockedUsers = () =>
  api.get('/forum/users/blocked').then(r => r.data);

// Bloquear usuario
export const blockUser = (username: string) =>
  api.post('/forum/users/block', { username, isAdmin: true }).then(r => r.data);

// Desbloquear usuario
export const unblockUser = (username: string) =>
  api.delete(`/forum/users/block/${username}`, { data: { isAdmin: true } }).then(r => r.data);

// Eliminar comentario
export const deleteComment = (topicId: string, commentId: string) =>
  api.delete(`/forum/topics/${topicId}/comments/${commentId}`, { data: { isAdmin: true } }).then(r => r.data);

// Editar topic
export const updateTopic = (id: string, data: { title?: string; content?: string; author: string }) =>
  api.patch(`/forum/topics/${id}`, data).then(r => r.data);