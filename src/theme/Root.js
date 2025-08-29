import React, {useEffect} from 'react';

const TOKENS = [
  'angrygoose','nerdygoose','sarcasticgoose','happygoose','mathgoose',
  'sharpgoose','surprisedgoose','weightliftinggoose'
];
const TOKEN_REGEX = new RegExp(`:(${TOKENS.join('|')})(?::)?`,'gi');

function makeImg(token){
  const file = token === 'weightliftinggoose' ? 'weightliftinggoose.png' : `${token}.png`;
  const alt = token.replace(/goose$/,' Goose').replace(/^(\w)/,c=>c.toUpperCase());
  const img = document.createElement('img');
  img.src = `/img/${file}`;
  img.alt = alt;
  img.loading = 'lazy';
  img.className = 'goose-inline';
  img.setAttribute('data-goose-inline','');
  return img;
}

function replaceInNode(root){
  console.log('[Root] replaceInNode called');
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  const SKIP = new Set(['CODE','PRE','SCRIPT','STYLE','NOSCRIPT']);
  const candidates = [];
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    const parentEl = textNode.parentElement;
    if (!parentEl) continue;
    // Only operate inside normal paragraphs / list items / blockquotes / headings
    if (!['P','LI','BLOCKQUOTE','H1','H2','H3','H4','H5','H6','SPAN'].includes(parentEl.tagName)) continue;
    // Skip if any ancestor is a disallowed element (code blocks etc.)
    let skip = false; let a = parentEl;
    while (a) { if (SKIP.has(a.tagName)) { skip=true; break; } a = a.parentElement; }
    if (skip) continue;
    if (TOKEN_REGEX.test(textNode.nodeValue)) {
      console.log('[Root] Found token in:', textNode.nodeValue);
      candidates.push(textNode);
      TOKEN_REGEX.lastIndex = 0;
    }
  }
  console.log('[Root] Found', candidates.length, 'candidates');
  candidates.forEach(textNode => {
    const value = textNode.nodeValue;
    let last = 0; let m; let any=false; TOKEN_REGEX.lastIndex=0;
    const frag = document.createDocumentFragment();
    while ((m = TOKEN_REGEX.exec(value))) {
      const start = m.index; const token = m[1].toLowerCase(); const match = m[0];
      if (start>last) frag.appendChild(document.createTextNode(value.slice(last,start)));
      frag.appendChild(makeImg(token));
      last = start + match.length; any=true;
    }
    if (!any) return;
    if (last < value.length) frag.appendChild(document.createTextNode(value.slice(last)));
    textNode.parentNode.replaceChild(frag, textNode);
  });
}

export default function Root({children}){
  useEffect(()=>{
    console.log('[Root] Starting token replacement...');
    // Run once per page load/navigation
    const container = document.querySelector('#__docusaurus');
    if (container) {
      console.log('[Root] Found container, replacing...');
      replaceInNode(container);
      console.log('[Root] Replacement complete');
    } else {
      console.log('[Root] No container found');
    }
  }, []);
  return <>{children}</>;
}
