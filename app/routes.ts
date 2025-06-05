import {
  type RouteConfig,
  index,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("signin", "routes/signin.tsx"),
  route("signup", "routes/signup.tsx"),
  route("booking", "routes/booking.tsx"),
  route("confirm", "routes/confirm.tsx"),
  route("profile", "routes/profile.tsx"),
  route("dashboard", "routes/dashboard.tsx")
] satisfies RouteConfig;
