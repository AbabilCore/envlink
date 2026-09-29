const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000/api"
    : "https://envlink.ababilspark.com/api";

export default API_URL;
