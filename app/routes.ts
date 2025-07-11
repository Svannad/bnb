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
  route("terms", "routes/terms.tsx"),
  route("services", "routes/services.tsx"),
  route("submit-book", "routes/submitBook.tsx"),
  route("booking/:id/update", "routes/bookingEdit.tsx"),
  route("confirm", "routes/confirm.tsx"),
  route("profile", "routes/profile.tsx"),
  route("profile/update", "routes/profileEdit.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/unavailable", "routes/unavailableAdd.tsx"),
  route("dashboard/:id/update", "routes/roomEdit.tsx")
] satisfies RouteConfig;
