import { useRouter } from "next/router";

export default function BookingPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Agendamento</h1>

      <h2>Profissional:</h2>
      <p>{slug}</p>

      <p>Esta é a página pública de agendamento.</p>
      <p>Aqui aparecerão os serviços e horários disponíveis.</p>
    </div>
  );
}
