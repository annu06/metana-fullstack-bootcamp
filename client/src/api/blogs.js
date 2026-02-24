import axios from "axios";

// if proxy isn't behaving, explicitly hit backend URL
const BASE_URL = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/blogs`
  : "http://localhost:3000/api/blogs";

export const getAllBlogs = async () => {
  const res = await axios.get(BASE_URL);
  return res.data;
};

export const getBlogById = async (id) => {
  const res = await axios.get(`${BASE_URL}/${id}`);
  return res.data;
};