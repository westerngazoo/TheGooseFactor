// Global Docusaurus plugin to apply gooseReactions remark plugin to ALL markdown/MDX
import gooseReactions from '../../src/remark/gooseReactions.js';

export default function gooseReactionsPlugin() {
  return {
    name: 'goose-reactions-global',
    configureMarkdown() {
      return { remarkPlugins: [gooseReactions] };
    },
  };
}
