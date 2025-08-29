import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';

const TOKENS = [
  'angrygoose','nerdygoose','sarcasticgoose','happygoose','mathgoose',
  'sharpgoose','surprisedgoose','weightliftinggoose'
];
const TOKEN_REGEX = new RegExp(`:(${TOKENS.join('|')})(?::)?`,'gi');

function replaceTokens(str){
  const out = []; let last = 0; let m; let key=0;
  while ((m = TOKEN_REGEX.exec(str))){
    const start = m.index; const match = m[0]; const token = m[1].toLowerCase();
    if (start>last) out.push(str.slice(last,start));
    const file = token === 'weightliftinggoose' ? 'weightliftinggoose.png' : `${token}.png`;
    const alt = token.replace(/goose$/,' Goose');
    out.push(<img key={`g${key++}`} src={`/img/${file}`} alt={alt} className="goose-inline" loading="lazy" />);
    last = start + match.length;
  }
  if (out.length===0) return str;
  if (last < str.length) out.push(str.slice(last));
  return out;
}

function P(props){
  const {children} = props;
  const processed = React.Children.map(children, child => {
    if (typeof child === 'string') return replaceTokens(child);
    return child;
  });
  return <p>{processed}</p>;
}

export default {
  ...MDXComponents,
  p: P,
};
