const API_URL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8000"
    : "https://xn--b5bqsp8e4a9a5gb5l.xn--94b0fay2dh.xn--54b7fta0cc";

export default API_URL;
