export const decodeTrustedLinks = (html: string) => {
  return html.replace(
    /\[\s*(&lt;a[\s\S]*?&gt;)([\s\S]*?)<\/a>\s*\]/gi,
    (_, encodedStartTag, innerHtml) => {
      const textarea = document.createElement('textarea');
      textarea.innerHTML = encodedStartTag;
      const decodedStartTag = textarea.value;
      return `[${decodedStartTag}${innerHtml}</a>]`;
    },
  );
};

export const replaceCitationRefs = (
  text: string,
  uniqueIdentifier: string,
  replacer: (content: string, idx: number) => void,
) => {
  if (!uniqueIdentifier) {
    return text;
  }

  let result = '';
  let i = 0;
  let occurrence = 0;

  while (i < text.length) {
    const start = text.indexOf(`[${uniqueIdentifier}](`, i);

    if (start === -1) {
      result += text.slice(i);
      break;
    }

    // copy text before marker
    result += text.slice(i, start);

    let j = start + '[_DW_REF_]('.length;
    let depth = 1;
    let content = '';

    while (j < text.length && depth > 0) {
      const ch = text[j++];

      if (ch === '(') depth++;
      else if (ch === ')') depth--;

      if (depth > 0) content += ch;
    }

    // 👇 pass occurrence index
    result += replacer(content, occurrence);

    occurrence++;
    i = j;
  }

  return result;
};

export const getHTMLFromContent = (content: string) => {
  const dummyDiv = document.createElement('div');
  dummyDiv.innerText = content;
  return dummyDiv.innerHTML;
};
