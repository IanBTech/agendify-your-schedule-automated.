import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function PlanosPage() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/dashboard/pagamentos", { replace: true });
  }, [navigate]);

  return null;
}
