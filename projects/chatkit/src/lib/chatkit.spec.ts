import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Chatkit } from './chatkit';
import { ChatWindowDataService } from './services/chat-window.data';
import { ChatWindowEventsService } from './services/chat-window.events';

describe('Chatkit', () => {
  let fixture: ComponentFixture<Chatkit>;
  let component: Chatkit;
  let dataService: ChatWindowDataService;
  let eventsService: ChatWindowEventsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Chatkit] }).compileComponents();
    fixture = TestBed.createComponent(Chatkit);
    component = fixture.componentInstance;
    dataService = fixture.debugElement.injector.get(ChatWindowDataService);
    eventsService = fixture.debugElement.injector.get(ChatWindowEventsService);
  });

  it('passes starter questions from chatkitData to the chat window', () => {
    const starterQuestions = [
      { question: 'Summarize this file', files: ['https://example.test/sample.pdf'] },
    ];

    component.chatkitData = { starterQuestions };

    expect(dataService.starterQuestions()).toEqual(starterQuestions);
  });

  it('emits starter question selections without changing existing outputs', () => {
    const selection = {
      question: 'Summarize this file',
      files: [new File(['sample'], 'sample.txt', { type: 'text/plain' })],
    };
    const emitted: typeof selection[] = [];
    component.starterQuestionSelect.subscribe((value) => emitted.push(value));

    eventsService.starterQuestionSelect$.next(selection);

    expect(emitted).toEqual([selection]);
  });
});
