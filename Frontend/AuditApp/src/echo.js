import Echo from "laravel-echo";
import Pusher from "pusher-js";

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: "sffqapl4lq9bfpnozlry",
  wsHost: window.location.hostname,
  wsPort: 8090,
  wssPort: 8090,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws"],
  cluster: "mt1",
  authEndpoint: `http://${window.location.hostname}:8000/api/broadcasting/auth`,
});

export default echo;
