import React, { useState } from 'react';
import { supabase } from '@/services/supabaseClient';
import { baseFieldClasses } from './FormElements';

type Lang = 'fr' | 'en' | 'ar';
type Role = 'agent' | 'user';

export default function ManagerInviteUserCard({ companyId }: { companyId?: string | null }) {
  const [mode, setMode] = useState<'invite' | 'create'>('invite');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<Role>('agent');
  const [lang, setLang] = useState<Lang>('fr');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);

    if (!email.trim() || !fullName.trim()) {
      setErr("Email et nom complet sont obligatoires.");
      return;
    }
    if (mode === 'create') {
      if (password.length < 8) return setErr("Mot de passe trop court (min. 8).");
      if (password !== password2) return setErr("Les deux mots de passe ne correspondent pas.");
    }

    setLoading(true);
    const payload: any = {
      mode,
      email: email.trim().toLowerCase(),
      full_name: fullName.trim(),
      role,
      language_preference: lang,
    };
    if (mode === 'create') {
      payload.password = password;
      payload.password_confirm = password2;
    }

    const { data, error } = await supabase.functions.invoke('manager-create-user', { body: payload });

    setLoading(false);

    // Gestion fine des erreurs renvoyées par l’Edge Function
    const serverError = (data as any)?.error || (error as any)?.message;

    if (error || serverError) {
      const details = (data as any)?.details;
      if (serverError === 'agent_limit_reached') {
        const c = details?.agentCount ?? '?';
        const m = details?.maxAgents ?? '?';
        setErr(`Limite d’agents atteinte (${c}/${m}). Surclasse ton plan pour ajouter plus d’agents.`);
        return;
      }
      if (serverError === 'invalid_role') return setErr("Rôle invalide. Choisis 'agent' ou 'user'.");
      if (serverError === 'weak_password') return setErr("Mot de passe trop faible (min. 8).");
      if (serverError === 'password_mismatch') return setErr("Les deux mots de passe ne correspondent pas.");
      if (serverError === 'unauthorized') return setErr("Session expirée. Reconnecte-toi.");
      if (serverError === 'profile_insert_failed') return setErr("Profil déjà existant ou conflit côté base.");
      if (serverError === 'invite_failed' || serverError === 'create_failed') {
        return setErr(`Erreur serveur: ${(data as any)?.details || 'opération impossible'}`);
      }
      return setErr(`Erreur: ${serverError}`);
    }

    // Succès
    setMsg(mode === 'invite'
      ? "Invitation envoyée et profil pré-créé."
      : "Utilisateur créé avec succès.");
    setEmail('');
    setFullName('');
    setPassword('');
    setPassword2('');
  }

  return (
    <div className="rounded-xl border border-slate-200 p-4 shadow-sm bg-white">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-slate-800">Ajouter un membre</h3>
        <div className="inline-flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('invite')}
            className={`px-3 py-1 text-sm rounded-md ${mode === 'invite' ? 'bg-white shadow' : 'text-slate-600'}`}
          >
            Inviter
          </button>
          <button
            type="button"
            onClick={() => setMode('create')}
            className={`px-3 py-1 text-sm rounded-md ${mode === 'create' ? 'bg-white shadow' : 'text-slate-600'}`}
          >
            Créer
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700">Nom complet</label>
          <input
            className={`${baseFieldClasses} mt-1`}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700">Email</label>
          <input
            type="email"
            className={`${baseFieldClasses} mt-1`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@exemple.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Rôle</label>
            <select
              className={`${baseFieldClasses} mt-1 pr-8`}
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <option value="agent">Agent</option>
              <option value="user">Utilisateur</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Langue</label>
            <select
              className={`${baseFieldClasses} mt-1 pr-8`}
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        {mode === 'create' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Mot de passe</label>
              <input
                type="password"
                className={`${baseFieldClasses} mt-1`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 caractères"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirmer</label>
              <input
                type="password"
                className={`${baseFieldClasses} mt-1`}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Répéter le mot de passe"
                required
              />
            </div>
          </div>
        )}

        {err && <div className="text-sm text-red-600">{err}</div>}
        {msg && <div className="text-sm text-green-600">{msg}</div>}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {loading ? 'Veuillez patienter…' : (mode === 'invite' ? 'Envoyer une invitation' : 'Créer l’utilisateur')}
          </button>
        </div>
      </form>

      {companyId ? (
        <p className="mt-3 text-xs text-slate-500">Société: {companyId}</p>
      ) : (
        <p className="mt-3 text-xs text-amber-600">⚠️ Votre profil manager n’a pas de company_id — la création échouera.</p>
      )}
    </div>
  );
}
