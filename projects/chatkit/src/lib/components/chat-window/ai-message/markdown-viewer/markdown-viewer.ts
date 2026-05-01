import {
  ChangeDetectionStrategy,
  Component,
  effect,
  input,
  signal,
  ViewEncapsulation,
  ElementRef,
  createComponent,
  inject,
  EnvironmentInjector,
  ApplicationRef,
  Injector,
  Type,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { marked } from 'marked';
import { ChatWindowDataService } from '../../../../services/chat-window.data';
import { decodeTrustedLinks, getHTMLFromContent, replaceCitationRefs } from './utils';
import { TChatkitCitation } from '../../../../typings/config';

@Component({
  selector: 'dw-markdown-viewer',
  standalone: true,
  template: `<article class="dw-markdown-container" [innerHTML]="mdHTML()"></article>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  styles: `
    .dw-markdown-container {
      white-space: pre;
      * {
        font-size: 14px;
        line-height: 21px;
        white-space: pre-line;
      }

      hr {
        margin-top: 1rem;
        margin-bottom: 1rem;
        border: 0;
        border-top: 1px solid rgba(0, 0, 0, 0.1);
      }

      p {
        margin: 0px;
        margin-bottom: 5px;
      }

      table {
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border-radius: 8px;
        font-size: 14px;
        display: block;
        overflow-x: auto;
        overflow-y: hidden;
        white-space: nowrap;
      }

      th,
      td {
        padding: 6px 10px;
        border: 1px solid #6da3e2;
        border-right: none;
        border-bottom: none;
        text-align: left;
        font-size: 14px;
        font-weight: 400;
        white-space: nowrap;
      }

      tr td:last-child,
      tr th:last-child {
        border-right: 1px solid #6da3e2;
      }

      tbody tr:last-child td {
        border-bottom: 1px solid #6da3e2;
      }

      thead th {
        background-color: #6da3e2;
        color: #111928;
        font-weight: 600;
        font-size: 12px;
      }

      /* Round corners */
      thead tr:first-child th:first-child {
        border-top-left-radius: 8px;
      }

      thead tr:first-child th:last-child {
        border-top-right-radius: 8px;
      }

      tbody tr:last-child td:first-child {
        border-bottom-left-radius: 8px;
      }

      tbody tr:last-child td:last-child {
        border-bottom-right-radius: 8px;
      }
    }
  `,
})
export class MarkdownViewer {
  messageId = input<string>('');
  content = input<string>('');

  mdHTML = signal<SafeHtml>('');

  private links: Record<string, string> = {};

  private envInjector = inject(EnvironmentInjector);
  private elementInjector = inject(Injector);
  private appRef = inject(ApplicationRef);
  private elementRef = inject(ElementRef);
  private sanitizer = inject(DomSanitizer);

  private readonly chatWindowDataService = inject(ChatWindowDataService);

  private injectedSlots = new Set<string>();

  processContent = async (content: string, chatkitCitation?: TChatkitCitation) => {
    const { uniqueIdentifier, component } = chatkitCitation || {};

    this.links = {};
    this.injectedSlots.clear();

    let dummyInnerHTML = getHTMLFromContent(content);

    dummyInnerHTML = dummyInnerHTML.replaceAll('\\n', '\n').replaceAll('<br>', '\n');

    dummyInnerHTML = replaceCitationRefs(dummyInnerHTML, uniqueIdentifier || '', (match, idx) => {
      this.links[idx] = match;
      const spanTag = `<span class="dw-ref-slot" data-ref-idx="${idx}"></span>`;
      return `[ ${spanTag} ]`;
    });

    let mdHTML = await marked.parse(dummyInnerHTML);
    mdHTML = decodeTrustedLinks(mdHTML);

    mdHTML = mdHTML.replaceAll('&lt;br&gt;', '\n');

    this.mdHTML.set(this.sanitizer.bypassSecurityTrustHtml(mdHTML));

    if (component) {
      setTimeout(() => this.injectComponents(component), 0);
    }
  };

  private injectComponents(component: Type<any>) {
    const slots = this.elementRef.nativeElement.querySelectorAll('.dw-ref-slot');

    slots?.forEach((span: HTMLSpanElement) => {
      const idx = span.dataset['refIdx'];
      if (!idx || this.injectedSlots.has(idx)) return;

      const componentRef = createComponent(component, {
        environmentInjector: this.envInjector,
        elementInjector: this.elementInjector,
      });

      componentRef.setInput('idx', idx);
      componentRef.setInput('text', this.links[parseInt(idx, 10)]);

      this.appRef.attachView(componentRef.hostView);

      const nativeEl = componentRef.location.nativeElement;
      span.appendChild(nativeEl);
      this.injectedSlots.add(idx);
    });
  }

  constructor() {
    effect(() => {
      this.processContent(this.content(), this.chatWindowDataService.chatkitCitation());
    });
  }
}
