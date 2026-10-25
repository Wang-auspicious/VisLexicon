// Token classes and language detection observed in the Bencho detail code viewer.
const tokens = {css:new RegExp([String.raw`(?<c>/\*[\s\S]*?\*/)`,String.raw`(?<s>"[^"\n]*"|'[^'\n]*')`,String.raw`(?<a>@[\w-]+)`,String.raw`(?<v>--[\w-]+)`,String.raw`(?<j>\b(?:const|let|var|function|return|if|else|for|new|await|async|true|false|null)\b)`,String.raw`(?<k>(?![^\n{]*=>)[.#&:\[*a-zA-Z][^\n{};/]*?(?=\s*\{))`,String.raw`(?<p>[-a-zA-Z][\w-]*(?=\s*:))`,String.raw`(?<f>[\w-]+(?=\())`,String.raw`(?<n>#[0-9a-fA-F]{3,8}\b|-?\d*\.\d+[a-z%]*|-?\d+[a-z%]*)`,String.raw`(?<x>[{}();:,])`].join(`|`),`g`),js:new RegExp([String.raw`(?<c>/\*[\s\S]*?\*/|//[^\n]*)`,String.raw`(?<s>"[^"\n]*"|'[^'\n]*'|\`[^\`]*\`)`,String.raw`(?<k>\b(?:const|let|var|function|return|if|else|for|while|new|import|from|export|default|async|await|=>|null|true|false)\b|=>)`,String.raw`(?<f>[\w$]+(?=\())`,String.raw`(?<p>[\w$]+(?=\s*:))`,String.raw`(?<n>-?\d*\.\d+|-?\d+)`,String.raw`(?<x>[{}()[\];:,.])`].join(`|`),`g`)};
function language(e){let t=/\b(const|let|function|=>|import |return )\b/.test(e),n=/^[ \t]*[-a-zA-Z][\w-]*\s*:\s*[^;\n]+;/m.test(e);return t&&!n?`js`:`css`}
export function highlightCode(source) {
 const expression=tokens[language(source)], result=[]; let cursor=0; expression.lastIndex=0;
 for (let match=expression.exec(source); match; match=expression.exec(source)) {
  if(match.index>cursor) result.push({kind:"",text:source.slice(cursor,match.index)});
  const kind=Object.keys(match.groups??{}).find(key=>match.groups[key]!==undefined)??"";
  result.push({kind,text:match[0]}); cursor=match.index+match[0].length;
  if(!match[0].length) expression.lastIndex++;
 }
 if(cursor<source.length) result.push({kind:"",text:source.slice(cursor)}); return result;
}
