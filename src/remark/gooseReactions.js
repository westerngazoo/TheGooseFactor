// Minimal plugin: replace :angrygoose style tokens with inline images.
// Usage: write :angrygoose or :angrygoose: (case-insensitive) anywhere in markdown.
import {visit} from 'unist-util-visit';
import fs from 'fs';
// Sentinel to verify module load
try { await (async()=>{ const {default:fs} = await import('fs'); fs.writeFileSync('goose-plugin-loaded','ok'); })(); } catch {}

const TOKENS = [
  'angrygoose','nerdygoose','sarcasticgoose','happygoose','mathgoose',
  'sharpgoose','surprisedgoose','weightliftinggoose'
];
const TOKEN_REGEX = new RegExp(`:(${TOKENS.join('|')})(?::)?`, 'gi');

function makeImg(token){
  const file = token === 'weightliftinggoose' ? 'weightliftinggoose.png' : `${token}.png`;
  const alt = token.replace(/goose$/,' Goose').replace(/^(\w)/,c=>c.toUpperCase());
  return {
    type: 'image',
    url: `/img/${file}`,
    alt,
    data: { hProperties: { className: 'goose-inline', loading: 'lazy' } }
  };
}

export default function gooseReactions(){
  return (tree) => {
  try { fs.writeFileSync('goose-transformer-called','1'); } catch {}
    visit(tree, 'text', (node, index, parent) => {
      const value = node.value;
      if (!value || value.indexOf(':') === -1) return;
  // scan and replace tokens
      let last = 0; let m; const out = [];
      while ((m = TOKEN_REGEX.exec(value))){
        const start = m.index; const match = m[0]; const token = m[1].toLowerCase();
        if (start > last) out.push({type:'text', value:value.slice(last,start)});
  out.push(makeImg(token));
        last = start + match.length;
      }
      if (!out.length) return;
      if (last < value.length) out.push({type:'text', value:value.slice(last)});
      parent.children.splice(index,1,...out);
      return index + out.length;
    });
  };
}
