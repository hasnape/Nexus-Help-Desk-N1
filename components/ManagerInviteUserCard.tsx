const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!isMounted.current) return;

  setMsg(null);
  setErr(null);

  if (!email || !fullName) {
    setErr(t("manager.invite.errors.required"));
    return;
  }

  if (role === "agent" && atLimit) {
    setErr(t("manager.invite.errors.agentCap"));
    return;
  }

  if (mode === "create") {
    if (password.length < 8) {
      setErr(t("manager.invite.errors.weakPassword"));
      return;
    }
    if (password !== passwordConfirm) {
      setErr(t("manager.invite.errors.passwordMismatch"));
      return;
    }
  }

  setLoading(true);
  const payload: Record<string, unknown> = {
    mode,
    email,
    full_name: fullName,
    role,
    language_preference: preferredLanguage,
    companyId,  // Assure que tu ajoutes companyId ici pour la fonction edge
  };

  if (mode === "create") {
    payload.password = password;
    payload.password_confirm = passwordConfirm;
  }

  const handleSuccess = async () => {
    setMsg(mode === "invite" ? t("manager.invite.success") : t("manager.invite.created"));
    setEmail("");
    setFullName("");
    if (mode === "create") {
      setPassword("");
      setPasswordConfirm("");
    }

    if (role === "agent") {
      await refreshAgentCount();
    }
  };

  try {
    const response = await invokeWithTimeout<FunctionSuccess | FunctionErrorPayload & { inviteLink?: string }>(payload);

    if (!isMounted.current) return;

    const { data, error } = response;

    if (error) {
      const contextPayload = (error as { context?: FunctionErrorPayload }).context;
      if (contextPayload?.error) {
        setErr(translateApiError(contextPayload.error, contextPayload.details));
      } else if (typeof error.message === "string" && error.message.length > 0) {
        setErr(translateApiError(error.message));
      } else {
        setErr(t("manager.invite.errors.generic"));
      }
      return;
    }

    if (!data) {
      await handleSuccess();
      return;
    }

    if ("error" in data) {
      // Cas spécial agent_limit_reached avec lien d'invitation
      if (data.error === "agent_limit_reached" && 'inviteLink' in data && typeof data.inviteLink === 'string') {
        setMsg(t("manager.invite.agentLimitReachedInvite", { link: data.inviteLink }));
        return;
      }
      setErr(translateApiError(data.error, "details" in data ? data.details : undefined));
      return;
    }

    await handleSuccess();
  } catch (error) {
    if (!isMounted.current) return;
    if (error instanceof Error && (error.message === "timeout" || error.name === "AbortError")) {
      setErr(t("manager.invite.errors.timeout"));
      return;
    }
    const message = error instanceof Error ? error.message : String(error ?? "");
    setErr(message || t("manager.invite.errors.generic"));
  } finally {
    if (isMounted.current) {
      setLoading(false);
    }
  }
};
