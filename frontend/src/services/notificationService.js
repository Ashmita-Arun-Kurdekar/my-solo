import API from "./api";

export const getNotifications = async () => {
  const response = await API.get("/notifications");
  return response.data;
};

export const markNotificationAsRead = async (id) => {
  const response = await API.patch(`/notifications/${id}/read`);
  return response.data;
};