import { useRouter } from "next/router";

export default function BookingPage() {
  const router = useRouter();
  const { slug } = router.query;

  return (
    <div style={{padding:40}}>
      <h1>Agendamento</h1>
      <p>Profissional: {slug}</p>
    </div>
  );
}
