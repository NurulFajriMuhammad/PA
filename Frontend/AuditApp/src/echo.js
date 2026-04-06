import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: "sffqapl4lq9bfpnozlry",

  wsHost: "10.253.128.12", // 🔥 sesuai IP kamu
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ["ws"],

  authEndpoint: "http://10.253.128.12:8000/broadcasting/auth",

  withCredentials: true, // 🔥 WAJIB kalau pakai Sanctum
});

export default echo;