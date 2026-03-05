
-- Timestamp update function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  profissao TEXT,
  plano TEXT NOT NULL DEFAULT 'teste',
  data_inicio_teste TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_expiracao_teste TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  lembretes_ativos BOOLEAN NOT NULL DEFAULT true,
  codigo_indicacao TEXT NOT NULL DEFAULT ('AGDFY-' || upper(substr(md5(random()::text), 1, 6))),
  indicador_id UUID REFERENCES public.profiles(id),
  meses_bonus INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome, email, profissao)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'profissao', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Clientes table
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own clients" ON public.clientes FOR SELECT USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can insert their own clients" ON public.clientes FOR INSERT WITH CHECK (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can update their own clients" ON public.clientes FOR UPDATE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can delete their own clients" ON public.clientes FOR DELETE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

-- Servicos table
CREATE TABLE public.servicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  nome_servico TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  preco TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own services" ON public.servicos FOR SELECT USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can insert their own services" ON public.servicos FOR INSERT WITH CHECK (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can update their own services" ON public.servicos FOR UPDATE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can delete their own services" ON public.servicos FOR DELETE USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);

CREATE TRIGGER update_servicos_updated_at BEFORE UPDATE ON public.servicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Public read for servicos (for booking page)
CREATE POLICY "Anyone can view services for booking" ON public.servicos FOR SELECT USING (true);

-- Disponibilidade table
CREATE TABLE public.disponibilidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  dia_semana INTEGER NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.disponibilidade ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can manage their availability" ON public.disponibilidade FOR ALL USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can view availability for booking" ON public.disponibilidade FOR SELECT USING (true);

-- Agendamentos table
CREATE TYPE public.agendamento_status AS ENUM ('confirmado', 'cancelado', 'concluido');

CREATE TABLE public.agendamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id),
  servico_id UUID NOT NULL REFERENCES public.servicos(id),
  data DATE NOT NULL,
  horario TIME NOT NULL,
  status agendamento_status NOT NULL DEFAULT 'confirmado',
  cliente_nome TEXT,
  cliente_telefone TEXT,
  cliente_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own appointments" ON public.agendamentos FOR SELECT USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Professionals can manage their own appointments" ON public.agendamentos FOR ALL USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
-- Allow anonymous insert for public booking
CREATE POLICY "Anyone can create appointments" ON public.agendamentos FOR INSERT WITH CHECK (true);

CREATE TRIGGER update_agendamentos_updated_at BEFORE UPDATE ON public.agendamentos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Unique constraint to prevent duplicate bookings
CREATE UNIQUE INDEX idx_unique_booking ON public.agendamentos (profissional_id, data, horario) WHERE status != 'cancelado';

-- Lista de espera table
CREATE TABLE public.lista_espera (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profissional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cliente_nome TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  servico_id UUID REFERENCES public.servicos(id),
  data_desejada DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lista_espera ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their waitlist" ON public.lista_espera FOR SELECT USING (
  profissional_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can join waitlist" ON public.lista_espera FOR INSERT WITH CHECK (true);

-- Public profiles view for booking links
CREATE POLICY "Public can view profiles for booking" ON public.profiles FOR SELECT USING (true);
