const ENV = {
  IS_DEV: process.env.NODE_ENV === "development",
  get API_URL() {
    return this.IS_DEV
      ? "http://localhost:8000/api"
      : "https://envlink.ababilspark.com/api";
  },
};

export default ENV;
