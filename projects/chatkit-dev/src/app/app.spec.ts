import { App } from './app';

describe('Chatkit demo state switch', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('preserves the populated demo and exposes an empty starter-question state', () => {
    const app = new App();

    expect(app.emptyConversationMode()).toBe(false);
    expect(app.chatkitData().chatkitConversation?.value.length).toBeGreaterThan(0);
    expect(app.chatkitData().starterQuestions).toEqual([]);

    app.toggleConversationMode();

    expect(app.emptyConversationMode()).toBe(true);
    expect(app.chatkitData().chatkitConversation?.value).toEqual([]);
    expect(app.chatkitData().starterQuestions?.length).toBe(3);
    expect(app.chatkitData().starterQuestions?.[1].files).toHaveLength(2);
  });
});
