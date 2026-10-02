/* 经过人工审查的口语表达。每条别名必须指向现有 Atlas 术语，不能凭空创建组件名。 */
export const QUERY_ALIASES = Object.freeze([
  Object.freeze({
    id: 'auto-grow-input',
    phrases: Object.freeze(['内容多了会长高', '越写越高', '自动增高', 'auto grow', 'auto resize', 'autosize']),
    tokens: Object.freeze(['auto-grow', 'textarea', 'composer']),
    targetIds: Object.freeze([
      'atlas-component-component-textarea',
      'atlas-component-component-composer',
    ]),
    reasonZh: '自动增高输入',
    rationale: '用户描述的是多行输入内容增加后容器随内容增长的能力；现有词条只能给出输入框与 Composer 候选。',
  }),
  Object.freeze({
    id: 'command-suggestions',
    phrases: Object.freeze(['输入命令后出现候选项', '命令候选', 'command menu', 'command palette', 'autocomplete', 'suggestions']),
    tokens: Object.freeze(['command', 'combobox', 'suggestions']),
    targetIds: Object.freeze([
      'atlas-component-component-command-palette',
      'atlas-component-component-combobox',
      'atlas-component-component-suggestion-chips',
      'atlas-component-component-follow-up-suggestions',
    ]),
    reasonZh: '命令与候选项',
    rationale: '用户描述的是输入过程中出现可选择候选的交互；Command palette、Combobox 与 Suggestions 需要并列解释。',
  }),
])

export const QUERY_ALIAS_BY_TARGET = Object.freeze(
  Object.fromEntries(
    QUERY_ALIASES.flatMap((alias) => alias.targetIds.map((targetId) => [targetId, alias])),
  ),
)
