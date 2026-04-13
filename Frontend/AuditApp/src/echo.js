import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "reverb",
  key: "sffqapl4lq9bfpnozlry",

  wsHost: "192.168.1.8", // 🔥 sesuai IP kamu
  wsPort: 8080,
  forceTLS: false,
  enabledTransports: ["ws"],

  authEndpoint: "http://192.168.1.8:8000/broadcasting/auth",

  withCredentials: true, // 🔥 WAJIB kalau pakai Sanctum
});

export default echo;