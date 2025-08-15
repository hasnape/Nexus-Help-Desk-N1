import React, { useEffect, useState } from 'react';
import axios from 'axios'; // Assure-toi qu'axios est installé via npm i axios

interface PlanLimitsProps {
  companyId: string;
}

const PlanLimits: React.FC<PlanLimitsProps> = ({ companyId }) => {
  const [limits, setLimits] = useState<{
    plan: string;
    agent_limit: number;
    ticket_limit: number;
    agent_count: number;
    ticket_count: number;
  } | null>(null);

  useEffect(() => {
    if (!companyId) return;

    axios.get(`http://localhost:4000/api/company/${companyId}`)
      .then(res => setLimits(res.data))
      .catch(err => console.error(err));
  }, [companyId]);

  if (!limits) return <p>Loading plan info...</p>;

  return (
    <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg mb-6">
      <h2 className="text-xl font-semibold mb-2">Votre plan actuel</h2>
      <p>Plan : <strong>{limits.plan}</strong></p>
      <p>Agents : {limits.agent_count} / {limits.agent_limit}</p>
      <p>Tickets ce mois : {limits.ticket_count} / {limits.ticket_limit}</p>
    </div>
  );
};

export default PlanLimits;
