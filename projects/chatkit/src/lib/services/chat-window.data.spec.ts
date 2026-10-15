import { ChatWindowDataService } from './chat-window.data';

describe('ChatWindowDataService', () => {
  it('stores and clears starter questions', () => {
    const service = new ChatWindowDataService();
    const questions = [
      {
        question: 'Compare the two reports',
        files: ['https://example.test/one.pdf', 'https://example.test/two.csv'],
      },
    ];

    service.setStarterQuestions(questions);
    expect(service.starterQuestions()).toEqual(questions);

    service.setStarterQuestions(undefined);
    expect(service.starterQuestions()).toEqual([]);
  });
});
