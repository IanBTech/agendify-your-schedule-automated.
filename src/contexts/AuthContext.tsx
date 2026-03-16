import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Profile {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  profissao: string | null;
  plano: string;
  codigo_indicacao: string;
  indicador_id: string | null;
  meses_bonus: number;
  lembretes_ativos: boolean;
  data_inicio_teste: string;
  data_expiracao_teste: string;
  created_at: string;
  updated_at: string;
  telefone: string | null;
  nome_negocio: string | null;
  foto_url: string | null;
  categoria_negocio: string | null;
  descricao_negocio: string | null;
  endereco: string | null;
  link_instagram: string | null;
  link_website: string | null;
  ultimo_login: string | null;
  status_conta: string;
  slug: string | null;
  tipo_conta: string;
  organization_id: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: string | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  role: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .single();
  return data as Profile | null;
}

async function fetchRole(userId: string) {
  const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
  return (data as string) || "user";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUserData = async (userId: string) => {
    const [p, r] = await Promise.all([fetchProfile(userId), fetchRole(userId)]);
    setProfile(p);
    setRole(r);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          setTimeout(async () => {
            await loadUserData(session.user.id);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadUserData(session.user.id).then(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const refreshProfile = async () => {
    if (session?.user) {
      await loadUserData(session.user.id);
    }
  };

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, profile, role, loading, isAdmin, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}
