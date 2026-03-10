export const stepsResponse = {
  agentID: '48988f3a-ee3e-4835-9fd6-f37c3ae2d24d',
  conversationID: '001f333a-f2e1-4d7a-bb67-080eaa779d35',
  messageID: '31c65ade-76b3-499a-a343-6d86cde30c5d',
  plan: [
    {
      planning: {
        llmThought:
          'The user wants responses for comments made on 20-Apr-2025. To include this date, I need to set start_date to 2025-04-19 (not inclusive) and to_date to 2025-04-21 (not inclusive), so that comments from 2025-04-20 are included. I will use a neutral sentiment threshold (2) to ensure all comments needing a response are captured.',
        type: 'Planning',
        name: 'Plan',
        metadata: {},
        status: 'completed',
      },
      executions: [
        {
          executions: {
            '277966e9-23bd-4959-88ca-675ecb623d7e-74f06972-ef38-440a-8dca-fe008023be11': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-74f06972-ef38-440a-8dca-fe008023be11',
              toolId: '8f40ce61-1ede-4918-ae26-7fe1bf10ac0f',
              toolType: 'dw-data-api',
              type: 'Tool Execution',
              name: 'GetRAReviewCommentsForDateRange',
              metadata: {},
              status: 'pending',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-af2d2c6f-12c6-4a9d-a770-a6942c788bb9': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-af2d2c6f-12c6-4a9d-a770-a6942c788bb9',
              toolId: '968422db-01da-479c-aa2a-c6a55595d3a7',
              toolType: 'llm',
              type: 'Tool Execution',
              name: 'sentiment_analyzer',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-9aa2ef89-f09a-4ace-9778-a0577624f6af': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-9aa2ef89-f09a-4ace-9778-a0577624f6af',
              toolId: '9e698d6c-1ae8-49b0-9be5-4e1d39b417e7',
              toolType: 'dw-data-api',
              type: 'Tool Execution',
              name: 'GetRAOrderDetails',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-bbf3df72-f849-43e4-96e4-64f71741fd42': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-bbf3df72-f849-43e4-96e4-64f71741fd42',
              toolId: '496076d1-2078-4e0c-82df-72d900100d66',
              toolType: 'dw-data-api',
              type: 'Tool Execution',
              name: 'GetRACustomers',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-c8ea2ed7-90a2-44ed-9b06-347ed1f1866d': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-c8ea2ed7-90a2-44ed-9b06-347ed1f1866d',
              toolId: '7e7e942b-ae8a-4a67-ae9d-a8b87c8767cb',
              toolType: 'call-agent',
              type: 'Tool Execution',
              name: 'ResearchReviewComment',
              metadata: {},
              status: 'completed',
              children: [
                {
                  llmThought:
                    'The user is asking for an analysis of a customer review comment, specifically about a refund issue. This aligns with the ReviewAnalysis scenario as it involves analyzing user feedback and validating the issues mentioned. The Help scenario is not applicable as the user is not asking for assistance or information about what the agent can do. The Greet and Exit scenarios are not relevant as the user is not greeting or saying goodbye.',
                  type: 'Scenario Selection',
                  name: 'ReviewAnalysis',
                  metadata: {},
                  status: 'pending',
                },
                {
                  planning: {
                    llmThought:
                      "To analyze the customer's review comment, I need to gather details about the order and check the relevant policies regarding refunds. First, I will get the order details using the order ID provided. Then, I will query the LeafyPortal policies to understand the refund process and any discrepancies in the refund amount. This will help determine if the customer's concerns are valid and if any action can be taken.",
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-1f286c10-3d69-459a-92fd-a5163d3196bf-1',
                      toolId: '9e698d6c-1ae8-49b0-9be5-4e1d39b417e7',
                      toolType: 'dw-data-api',
                      type: 'Tool Execution',
                      name: 'GetRAOrderDetails',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-1f286c10-3d69-459a-92fd-a5163d3196bf-2',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-1f286c10-3d69-459a-92fd-a5163d3196bf-3',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought: 'Re-planning is set during Planning',
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 0',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      "Based on the previous plan's execution, I have gathered the order details and the refund policy. The order was returned, and the refund policy states that refunds are processed within 7-14 business days after the return is received and inspected. The customer is concerned about the refund amount and timing. I need to check the customer's details to provide a more personalized response and verify if there are any discrepancies in the refund process.",
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-1f286c10-3d69-459a-92fd-a5163d3196bf-1',
                      toolId: '496076d1-2078-4e0c-82df-72d900100d66',
                      toolType: 'dw-data-api',
                      type: 'Tool Execution',
                      name: 'GetRACustomers',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought: 'Re-planning is set during Planning',
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 1',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      'Based on the previous iterations, I have gathered the order details, refund policy, and customer details. The order was returned, and the refund policy states that refunds are processed within 7-14 business days after the return is received and inspected. The customer is concerned about the refund amount and timing. The discrepancy in the refund amount could be due to non-refundable shipping fees. I will now check the policy for any escalation mechanism and provide that as a final solution to the customer.',
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-1f286c10-3d69-459a-92fd-a5163d3196bf-1',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought:
                      "Based on the gathered information, I can analyze the customer's review comment regarding the refund issue. The order was returned, and the refund policy states that refunds are processed within 7-14 business days after the return is received and inspected. The discrepancy in the refund amount could be due to non-refundable shipping fees. The customer can escalate the issue through the Leafy Corp customer service team if needed.",
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 2',
                  metadata: {},
                  status: 'completed',
                },
              ],
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-721ffe9f-9198-48e4-9f9a-06e0f6575f72': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-721ffe9f-9198-48e4-9f9a-06e0f6575f72',
              toolId: '93fb6c93-03c4-48de-962d-e4b3f5b81d54',
              toolType: 'call-agent',
              type: 'Tool Execution',
              name: 'SuggestEmailResponseForReview',
              metadata: {},
              status: 'completed',
              children: [
                {
                  llmThought:
                    'The user is requesting the generation of an email response to a customer review, providing specific details and guidelines for the email. This aligns with the GenerateEmail scenario. The Help scenario is not applicable as the user is not asking for assistance or information about what the agent can do. The Greet and Exit scenarios are also not applicable as the user is neither greeting nor saying goodbye.',
                  type: 'Scenario Selection',
                  name: 'GenerateEmail',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      "To address the user's query, I will first generate a draft email using the GenerateDraftCustomerEmail tool. Then, I will critique the draft email using the CritiqueEmailBody tool to ensure it aligns with company guidelines. Finally, I will use the GenerateFinalEmail tool to incorporate the critique and generate the final email. This sequence will ensure the email is professional and courteous, addressing the customer's concerns effectively.",
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-3c65f581-452c-45a5-9be3-263fae0bdbb9-1',
                      toolId: '3c92cdf9-64bc-49ce-b814-51b54268b748',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'GenerateDraftCustomerEmail',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-3c65f581-452c-45a5-9be3-263fae0bdbb9-2',
                      toolId: '8ee5cc32-9f06-4d7f-8406-b75889b9f872',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'CritiqueEmailBody',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-3c65f581-452c-45a5-9be3-263fae0bdbb9-3',
                      toolId: '71a55620-1df9-4457-b157-79c91cbda004',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'GenerateFinalEmail',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought:
                      "The final email has been generated incorporating the critique and additional information provided. It addresses the customer's concerns about the refund timeline and amount discrepancy, while also providing contact information for further assistance.",
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 0',
                  metadata: {},
                  status: 'completed',
                },
              ],
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-f4b4380b-67df-4a7d-8155-6cc51a3a5ee9': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-f4b4380b-67df-4a7d-8155-6cc51a3a5ee9',
              toolId: '968422db-01da-479c-aa2a-c6a55595d3a7',
              toolType: 'llm',
              type: 'Tool Execution',
              name: 'sentiment_analyzer',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-a6f3f0b5-eace-4369-b2ca-6f98be3219d5': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-a6f3f0b5-eace-4369-b2ca-6f98be3219d5',
              toolId: '9e698d6c-1ae8-49b0-9be5-4e1d39b417e7',
              toolType: 'dw-data-api',
              type: 'Tool Execution',
              name: 'GetRAOrderDetails',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-d6698923-341d-4d8e-9dd5-455ba6c47d0b': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-d6698923-341d-4d8e-9dd5-455ba6c47d0b',
              toolId: '496076d1-2078-4e0c-82df-72d900100d66',
              toolType: 'dw-data-api',
              type: 'Tool Execution',
              name: 'GetRACustomers',
              metadata: {},
              status: 'completed',
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-9b9e4b17-4c5e-46cc-851d-eb637e2b1b57': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-9b9e4b17-4c5e-46cc-851d-eb637e2b1b57',
              toolId: '7e7e942b-ae8a-4a67-ae9d-a8b87c8767cb',
              toolType: 'call-agent',
              type: 'Tool Execution',
              name: 'ResearchReviewComment',
              metadata: {},
              status: 'completed',
              children: [
                {
                  llmThought:
                    "The user's query is asking for an analysis of a specific customer review comment. This aligns with the ReviewAnalysis scenario, as the user wants to understand or validate the issues mentioned in the review. The Help scenario is not applicable because the user is not asking for assistance or information about what the agent can do. The Greet scenario is not relevant because the user is not greeting or saying hello. The Exit scenario is not applicable because the user is not indicating that the conversation is over or saying goodbye.",
                  type: 'Scenario Selection',
                  name: 'ReviewAnalysis',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      "To analyze the customer's review comment, I need to gather information about the order and the customer's eligibility for a return based on our policies. First, I will get the order details using the order ID. Then, I will check the return policy to see if the customer's request aligns with it. This will help determine if the customer has a legitimate complaint and if any action can be taken.",
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-dbe76edb-05c2-413a-811e-886a00a93ced-1',
                      toolId: '9e698d6c-1ae8-49b0-9be5-4e1d39b417e7',
                      toolType: 'dw-data-api',
                      type: 'Tool Execution',
                      name: 'GetRAOrderDetails',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-dbe76edb-05c2-413a-811e-886a00a93ced-2',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought: 'Re-planning is set during Planning',
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 0',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      "Based on the previous plan's results, I have the order details and the general return policy. The order was completed, and the product is a decorative plate. The return policy states that products must be returned within 30 days of receipt and must be in unused, original condition. Since the order was completed on 2025-04-06 and the review was made on 2025-04-20, the customer is within the 30-day return window. However, the policy does not specify if plates are non-returnable. I need to verify if plates fall under any non-returnable categories. If they do not, the customer should be eligible for a return. I will now check if plates are specifically mentioned as non-returnable in the policy.",
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-dbe76edb-05c2-413a-811e-886a00a93ced-1',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought: 'Re-planning is set during Planning',
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 1',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      'Based on the previous iterations, I have gathered the order details and the general return policy. The customer is within the 30-day return window, but the policy does not specify if decorative plates are non-returnable. I need to verify if decorative plates are specifically mentioned as non-returnable in the policy. If they are not, the customer should be eligible for a return. I will now check if decorative plates are specifically mentioned as non-returnable in the policy.',
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-dbe76edb-05c2-413a-811e-886a00a93ced-1',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought: 'Re-planning is set during Planning',
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 2',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      'Based on the previous iterations, I have gathered the order details and the general return policy. The customer is within the 30-day return window, but the policy does not specify if decorative plates are non-returnable. I need to verify if decorative plates are specifically mentioned as non-returnable in the policy. If they are not, the customer should be eligible for a return. I will now check if decorative plates are specifically mentioned as non-returnable in the policy.',
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-dbe76edb-05c2-413a-811e-886a00a93ced-1',
                      toolId: '5e411f2e-ba9f-476b-b841-90ba80730f8e',
                      toolType: 'qna',
                      type: 'Tool Execution',
                      name: 'GetLeafyPortalPolicyQnA',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought:
                      "The customer review comment indicates dissatisfaction with a decorative plate and an issue with returning it. The order details show that the order was completed on 2025-04-06, and the review was made on 2025-04-20, which is within the 30-day return window. However, the policy does not specify if decorative plates are non-returnable. The customer should be eligible for a return if decorative plates are not categorized as non-returnable. Since the policy does not explicitly mention decorative plates, it is advisable to contact Leafy Corp's customer service for clarification.",
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 3',
                  metadata: {},
                  status: 'completed',
                },
              ],
            },
            '277966e9-23bd-4959-88ca-675ecb623d7e-bd48d524-faa4-4c18-833b-05c784df261f': {
              executionId:
                '277966e9-23bd-4959-88ca-675ecb623d7e-bd48d524-faa4-4c18-833b-05c784df261f',
              toolId: '93fb6c93-03c4-48de-962d-e4b3f5b81d54',
              toolType: 'call-agent',
              type: 'Tool Execution',
              name: 'SuggestEmailResponseForReview',
              metadata: {},
              status: 'completed',
              children: [
                {
                  llmThought:
                    'The user is asking for an email to be generated in response to a customer review, taking into account specific details and guidelines. This aligns with the GenerateEmail scenario. The Help scenario is not applicable as the user is not asking for assistance or information about what the agent can do. The Greet and Exit scenarios are also not applicable as the user is not greeting or saying goodbye.',
                  type: 'Scenario Selection',
                  name: 'GenerateEmail',
                  metadata: {},
                  status: 'completed',
                },
                {
                  planning: {
                    llmThought:
                      'To generate the appropriate email response, I will first use the GenerateDraftCustomerEmail tool to create a draft email based on the provided brief and customer information. Then, I will use the CritiqueEmailBody tool to review the draft for company guidelines. Finally, I will use the GenerateFinalEmail tool to generate the final email body by applying the review comments to the draft.',
                    type: 'Planning',
                    name: 'Plan',
                    metadata: {},
                    status: 'completed',
                  },
                  executions: [
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-417c9c36-9cfd-43cc-920a-606325e9f004-1',
                      toolId: '3c92cdf9-64bc-49ce-b814-51b54268b748',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'GenerateDraftCustomerEmail',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-417c9c36-9cfd-43cc-920a-606325e9f004-2',
                      toolId: '8ee5cc32-9f06-4d7f-8406-b75889b9f872',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'CritiqueEmailBody',
                      metadata: {},
                      status: 'completed',
                    },
                    {
                      executionId:
                        '277966e9-23bd-4959-88ca-675ecb623d7e-417c9c36-9cfd-43cc-920a-606325e9f004-3',
                      toolId: '71a55620-1df9-4457-b157-79c91cbda004',
                      toolType: 'llm',
                      type: 'Tool Execution',
                      name: 'GenerateFinalEmail',
                      metadata: {},
                      status: 'completed',
                    },
                  ],
                  agentResponse: {
                    llmThought:
                      "The final email has been generated successfully, incorporating the critique comments and additional information provided. The email addresses the customer's concerns about returning a decorative plate, clarifies the return policy, and provides contact information for further assistance.",
                    type: 'Join',
                    name: 'Agent Response',
                    metadata: {},
                    status: 'completed',
                  },
                  type: 'Iteration',
                  name: 'Iteration 0',
                  metadata: {},
                  status: 'completed',
                },
              ],
            },
          },
          executionId: '277966e9-23bd-4959-88ca-675ecb623d7e-1',
          toolId: '74c3504a-385a-4c01-8a82-66aa1eea8e1d',
          toolType: 'composite',
          type: 'Tool Execution',
          name: 'ReviewCommentResponses',
          metadata: {},
          status: 'completed',
        },
      ],
      agentResponse: {
        llmThought:
          'The tool has provided suggested responses for two review comments made on 20-Apr-2025, including detailed context and tailored replies. All required information is present to generate the final answer as per the instructions.',
        type: 'Join',
        name: 'Agent Response',
        metadata: {},
        status: 'completed',
      },
      type: 'Iteration',
      name: 'Iteration 0',
      metadata: {},
      status: 'completed',
    },
  ],
};
