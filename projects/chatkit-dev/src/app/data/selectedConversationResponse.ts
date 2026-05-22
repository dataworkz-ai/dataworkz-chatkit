export const selectedConversationResponse = {
  conversationId: '',
  agentId: '',
  accountId: '',
  userId: '',
  apiUserName: '',
  conversationTitle: '',
  conversationStartTs: '',
  conversationEndTs: '',
  tasks: [
    {
      id: '',
      conversationID: '',
      status: {
        state: '',
        timestamp: '',
      },
      history: [
        {
          messageID: '',
          conversationID: '',
          taskID: '',
          timestamp: '',
          thumbsUpOrDown: 0,
          timeToAnswer: 0,
          kind: '',
          role: '',
          parts: [
            {
              kind: '',
              text: '',
            },
          ],
        },
      ],
    },
  ],
  agentDetails: {},
};
