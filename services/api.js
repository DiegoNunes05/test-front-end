import axios from 'axios';
import { API_URL } from '@env';

const api = axios.create({
  baseURL: API_URL,
});

export const loadsApi = {
  getAll: () => api.get('/loads'),
  getById: (id) => api.get(`/loads/${id}`),
  updateStatus: (id, status) => api.patch(`/loads/${id}`, { status }),
  getByStatus: (status) => api.get(`/loads?status=${status}`),
  getCompletedLoads: async () => {
    const response = await api.get('/loads?status=completed');
    return response;
  },

  uploadDocument: (loadId, documentData) => {
    const newDoc = {
      loadId,
      ...documentData,
      uploadDate: new Date().toISOString(),
      status: 'pending'
    };
    return api.post('/documents', newDoc);
  }
};

export const messagesApi = {
  getByDriver: (driverId) => api.get(`/messages?receiverId=${driverId}&_sort=timestamp&_order=asc`),
  getAllUserMessages: (userId) => api.get(`/messages?_sort=timestamp&_order=asc`),
  send: (message) => api.post('/messages', {
    ...message,
    timestamp: new Date().toISOString(),
    read: false
  }),
  markAsRead: (id) => api.patch(`/messages/${id}`, { read: true }),
  deleteMessage: (id) => api.delete(`/messages/${id}`),
};

export const documentsApi = {
  getByLoadId: (loadId) => api.get(`/documents?loadId=${loadId}`),
  uploadDocument: (documentData) => api.post('/documents', documentData),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`),
};

export const notificationsApi = {
  getByDriver: (driverId) => api.get(`/notifications`),
  getAll: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}`, { read: true }),
  markAllAsRead: (userId) => {
    return api.get(`/notifications?read=false`)
      .then(response => {
        const promises = response.data.map(notification => 
          api.patch(`/notifications/${notification.id}`, { read: true })
        );
        return Promise.all(promises);
      });
  },
  delete: (id) => api.delete(`/notifications/${id}`)
};

export const driversApi = {
  getById: (id) => api.get(`/drivers/${id}`),
  update: (id, data) => api.patch(`/drivers/${id}`, data),
  updatePhoto: (id, photoURL) => api.patch(`/drivers/${id}`, { photoURL })
};

export default api;