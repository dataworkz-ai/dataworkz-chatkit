import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ChatWindow } from './chat-window';
import { ChatWindowDataService } from '../../services/chat-window.data';
import { ChatWindowEventsService } from '../../services/chat-window.events';

describe('ChatWindow starter questions', () => {
  let fixture: ComponentFixture<ChatWindow>;
  let component: ChatWindow;
  let dataService: ChatWindowDataService;
  let eventsService: ChatWindowEventsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChatWindow],
      providers: [ChatWindowDataService, ChatWindowEventsService],
    }).compileComponents();
    fixture = TestBed.createComponent(ChatWindow);
    component = fixture.componentInstance;
    dataService = TestBed.inject(ChatWindowDataService);
    eventsService = TestBed.inject(ChatWindowEventsService);
  });

  it('renders starter questions only in the existing empty-chat state', () => {
    dataService.setStarterQuestions([{ question: 'Try this', files: [] }]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dw-starter-question')?.textContent).toContain(
      'Try this',
    );

    dataService.setChatkitConversation({
      loading: false,
      error: '',
      value: [{ taskId: 'task-1', messageIds: [] }],
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dw-starter-question')).toBeNull();
  });

  it('emits a selected question with all successfully loaded sample files', () => {
    const fileOne = new File(['one'], 'one.pdf', { type: 'application/pdf' });
    const fileTwo = new File(['two'], 'two.csv', { type: 'text/csv' });
    dataService.setStarterQuestions([
      { question: 'Compare files', files: ['https://example.test/one.pdf', 'two.csv'] },
    ]);
    component.starterFileStates.set([
      [
        { label: 'one.pdf', url: 'https://example.test/one.pdf', status: 'success', file: fileOne },
        { label: 'two.csv', url: 'two.csv', status: 'success', file: fileTwo },
      ],
    ]);
    const selections: { question: string; files: File[] }[] = [];
    eventsService.starterQuestionSelect$.subscribe((selection) => selections.push(selection));

    component.selectStarterQuestion(0);

    expect(selections).toEqual([{ question: 'Compare files', files: [fileOne, fileTwo] }]);
  });

  it('keeps an errored sample question disabled', () => {
    dataService.setStarterQuestions([
      { question: 'Broken sample', files: ['https://example.test/missing.pdf'] },
    ]);
    component.starterFileStates.set([
      [
        {
          label: 'missing.pdf',
          url: 'https://example.test/missing.pdf',
          status: 'error',
          file: null,
        },
      ],
    ]);
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.dw-starter-question') as HTMLButtonElement;
    expect(card.disabled).toBe(true);
    expect(card.classList).toContain('dw-starter-question-error');
  });

  it('renders repeated sample URLs as separate files', () => {
    dataService.setStarterQuestions([
      { question: 'Compare copies', files: ['/sample.csv', '/sample.csv'] },
    ]);
    component.starterFileStates.set([
      [
        {
          label: 'sample.csv',
          url: '/sample.csv',
          status: 'success',
          file: new File(['one'], 'sample.csv'),
        },
        {
          label: 'sample.csv',
          url: '/sample.csv',
          status: 'success',
          file: new File(['two'], 'sample.csv'),
        },
      ],
    ]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.dw-starter-question-file').length).toBe(2);
  });

  it('keeps overflowing starter questions reachable from the top', () => {
    dataService.setStarterQuestions(
      Array.from({ length: 12 }, (_, index) => ({ question: `Question ${index + 1}`, files: [] })),
    );
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.dw-start-conversation-wrapper') as HTMLElement;
    const body = fixture.nativeElement.querySelector('.dw-chat-window-body') as HTMLElement;

    expect(getComputedStyle(body).display).toBe('grid');
    expect(getComputedStyle(body).alignContent).toBe('start');
    expect(getComputedStyle(body).gridAutoRows).toBe('max-content');
    expect(getComputedStyle(wrapper).display).toBe('grid');
    expect(getComputedStyle(wrapper).gridAutoRows).toBe('max-content');
    expect(getComputedStyle(wrapper).minHeight).toBe('100%');
    expect(getComputedStyle(wrapper).alignContent).toBe('safe center');
    expect(getComputedStyle(wrapper).justifyItems).toBe('center');
    expect(getComputedStyle(body).minHeight).toBe('0px');
    expect(getComputedStyle(body).overflowY).toBe('auto');
  });

  it('keeps conversation messages in natural-height grid rows', () => {
    dataService.setChatkitConversation({
      loading: false,
      error: '',
      value: [{ taskId: 'task-1', messageIds: [] }],
    });
    fixture.detectChanges();
    const body = fixture.nativeElement.querySelector('.dw-chat-window-body') as HTMLElement;

    expect(getComputedStyle(body).display).toBe('grid');
    expect(getComputedStyle(body).gridAutoRows).toBe('max-content');
    expect(getComputedStyle(body).alignContent).toBe('start');
  });

  it('does not follow the bottom while rendering the empty starter state', fakeAsync(() => {
    fixture.detectChanges();
    const setScroll = vi.spyOn(dataService, 'setChatkitScroll');

    dataService.setStarterQuestions([{ question: 'Try this', files: [] }]);
    fixture.detectChanges();
    tick();

    expect(setScroll).not.toHaveBeenCalled();
  }));
});
