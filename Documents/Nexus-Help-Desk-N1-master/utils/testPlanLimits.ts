import { Plan } from '../types';

// Utilitaire pour tester les limitations de plan
export const testPlanScenarios = () => {
  console.log('🧪 Test des limitations de plan');
  
  // Simulation de données de test
  const testScenarios = [
    {
      plan: 'freemium' as Plan,
      agents: 3,
      ticketsThisMonth: 150,
      expected: {
        canAddAgent: false,
        canCreateTicket: true,
        hasVoiceFeatures: false,
        hasAppointmentScheduling: false
      }
    },
    {
      plan: 'freemium' as Plan,
      agents: 2,
      ticketsThisMonth: 200,
      expected: {
        canAddAgent: true,
        canCreateTicket: false,
        hasVoiceFeatures: false,
        hasAppointmentScheduling: false
      }
    },
    {
      plan: 'standard' as Plan,
      agents: 10,
      ticketsThisMonth: 500,
      expected: {
        canAddAgent: true,
        canCreateTicket: true,
        hasVoiceFeatures: false,
        hasAppointmentScheduling: false
      }
    },
    {
      plan: 'pro' as Plan,
      agents: 15,
      ticketsThisMonth: 1000,
      expected: {
        canAddAgent: true,
        canCreateTicket: true,
        hasVoiceFeatures: true,
        hasAppointmentScheduling: true
      }
    }
  ];

  testScenarios.forEach((scenario, index) => {
    console.log(`\n📋 Scénario ${index + 1}: Plan ${scenario.plan}`);
    console.log(`  - Agents: ${scenario.agents}`);
    console.log(`  - Tickets ce mois: ${scenario.ticketsThisMonth}`);
    console.log(`  - Peut ajouter agent: ${scenario.expected.canAddAgent ? '✅' : '❌'}`);
    console.log(`  - Peut créer ticket: ${scenario.expected.canCreateTicket ? '✅' : '❌'}`);
    console.log(`  - Fonctions vocales: ${scenario.expected.hasVoiceFeatures ? '✅' : '❌'}`);
    console.log(`  - Rendez-vous: ${scenario.expected.hasAppointmentScheduling ? '✅' : '❌'}`);
  });

  console.log('\n✅ Tests terminés');
};