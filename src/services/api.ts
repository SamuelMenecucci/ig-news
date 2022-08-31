import axios from "axios";

export const api = axios.create({
  //as the address of the url that will be the api is the same as the one the application is running, I don't need to pass ir complete. I can just leave /path that axios will access the address there the application is running
  baseURL: "/api",
});
