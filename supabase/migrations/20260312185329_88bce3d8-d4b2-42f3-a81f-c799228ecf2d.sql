
CREATE TABLE public.bloqueios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('horario', 'dia', 'periodo')),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  horario_inicio TIME WITHOUT TIME ZONE,
  horario_fim TIME WITHOUT TIME ZONE,
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bloqueios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage their own blocks"
ON public.bloqueios FOR ALL
USING (profissional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()))
WITH CHECK (profissional_id IN (SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()));

CREATE POLICY "Anyone can view blocks for booking"
ON public.bloqueios FOR SELECT
USING (true);
