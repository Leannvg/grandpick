import { useNavigate } from "react-router-dom";

export function useRedirectToTab() {
  const navigate = useNavigate();
  return (tabName) => {
    navigate({ pathname: "/admin/dashboard", search: `?tab=${tabName}` });
  };
}