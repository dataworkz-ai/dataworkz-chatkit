export const selectedAgentResponse = {
  name: 'AppleFinancialAssistant',
  id: '4cea0808-e1bb-45e0-a669-1c6010c82d90',
  description:
    "An agent that assists with queries regarding Apple Inc.'s financial information, specifically 10k filings.",
  notes: null,
  persona: 'You are an assistant to apples financial information for 10k filing.',
  defaultScenario: null,
  scenarioSelectionFailureMessage:
    'I could not find the financial information you requested. Please try rephrasing your query.',
  scenarios:
    '[{"name":"AppleFinancialInfo","description":"Handles queries related to Apple\'s financial information and 10k filings.","examples":["What is Apple\'s revenue for the last fiscal year?","Show me Apple\'s 10k filing for 2022.","Summarize Apple\'s financial position from their latest 10k."],"toolRefs":[{"toolId":"61a695b7-1115-4aba-8e7f-09d81420cc87"}],"instructions":"","planningInstructions":"","config":{},"disabled":false,"flowType":false,"reasoningType":true},{"name":"Help","description":"If the users asks for help or wants to know what the agent can do.","examples":["help me","What can you do?","What can I ask?","How can you help me?"],"toolRefs":[],"persona":"","instructions":"You are an agent that can help with the following - \\nHandles queries related to Apple\'s financial information and 10k filings..\\n Please respond to the user with a helpful response.","planningInstructions":"You can directly invoke join to answer the user\'s query","config":{},"disabled":false,"flowType":false,"reasoningType":true},{"name":"Greet","description":"If the user greets us or says hello or something similar","examples":["Hey","Good morning!"],"toolRefs":[],"persona":"","instructions":"Please respond with a helpful message and a cheerful, professional greeting","planningInstructions":"","config":{},"disabled":false,"flowType":false,"reasoningType":true},{"name":"Exit","description":"If the user says goodbye or indicates that the conversation is over","examples":["Thank you!","I am all set."],"toolRefs":[],"persona":"","instructions":"Please thank the user for their time and interest.","planningInstructions":"","config":{},"disabled":false,"flowType":false,"reasoningType":true}]',
  tools: null,
  contextValues: '[]',
  config: null,
  metadata: null,
  scenariosCount: 4,
  createdBy: 'Ln5GW71BQpOr9m234XqPcA',
  createdDate: 1765256683845,
  modifiedBy: 'Ln5GW71BQpOr9m234XqPcA',
  modifiedDate: 1765256865870,
};
