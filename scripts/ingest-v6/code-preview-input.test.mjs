import test from 'node:test'
import assert from 'node:assert/strict'
import { enumerateExports } from './code-preview-input.mjs'

test('CSF defaults are metadata; original filters preserve every excluded export', () => {
  const result = enumerateExports('src/Button.stories.tsx', `
    import type { Meta, StoryObj } from '@storybook/react';
    import { Button } from './Button';
    const meta = { title: 'Atoms/Button', component: Button, excludeStories: /Data$/ } satisfies Meta<typeof Button>;
    export default meta;
    export const Primary: StoryObj<typeof meta> = { args: { disabled: false } };
    export const exampleData = { text: 'data' };
    export const NotAStory = 42;
  `)
  assert.equal(result.title, 'Atoms/Button')
  assert.equal(result.entries.find(e => e.name === 'default').disposition, 'csf-metadata')
  assert.equal(result.entries.find(e => e.name === 'Primary').entryMode, 'csf')
  assert.equal(result.entries.find(e => e.name === 'exampleData').disposition, 'meta-excluded')
  assert.equal(result.entries.find(e => e.name === 'NotAStory').disposition, 'non-story-export')
  assert.equal(result.entries.length, 4)
  assert.ok(result.entries.every(e => e.line > 0))
})

test('CSF2 bound templates and aliases are original exports; no source executes', () => {
  const result = enumerateExports('Button.stories.jsx', `
    import React from 'react';
    export default { title: 'Button', component: 'button', includeStories: ['Basic', 'Renamed'] };
    const Template = (args) => <button {...args} />;
    export const Basic = Template.bind({});
    const Local = () => <button>Actual upstream example</button>;
    export { Local as Renamed };
    export { Missing } from './elsewhere';
    throw Error('This source must never execute during AST enumeration');
  `)
  assert.deepEqual(result.entries.filter(e => e.disposition === 'pending-compile').map(e => e.name), ['Basic', 'Renamed'])
  assert.equal(result.entries.find(e => e.name === 'Missing').disposition, 'unresolved-reexport')
})

test('non-React adapters stay excluded even if the enclosing package also has React', () => {
  const result = enumerateExports('Button.stories.ts', `
    import { Meta } from '@storybook/vue3';
    export default { title: 'Vue', component: {} };
    export const Basic = { args: {} };
  `, { reactPackage: true })
  assert.ok(result.entries.every(e => e.disposition === 'unsupported-framework'))
})

test('named/default functions, memo and forwardRef are separate component exports', () => {
  const result = enumerateExports('src/Button.tsx', `
    import React, { memo, forwardRef } from 'react';
    export function Basic() { return <button>Basic</button>; }
    export const MemoButton = memo(Basic);
    const RefButton = forwardRef((props, ref) => <button ref={ref} />);
    export { RefButton };
    export const OPTIONS = { compact: true };
    export default Basic;
  `)
  assert.deepEqual(result.entries.filter(e => e.disposition === 'pending-compile').map(e => e.name), ['Basic', 'MemoButton', 'RefButton'])
  assert.equal(result.entries.find(e => e.name === 'default').disposition, 'duplicate-export-alias')
  assert.equal(result.entries.find(e => e.name === 'default').duplicateOfExport, 'Basic')
  assert.equal(result.entries.find(e => e.name === 'OPTIONS').disposition, 'non-component-export')
})

test('dynamic CSF filtering is retained as unresolved instead of inventing stories', () => {
  const result = enumerateExports('Button.stories.ts', `
    import type { Meta } from '@storybook/react';
    const meta = { ...shared, component: Button, includeStories: pickExports() };
    export default meta;
    export const Basic = { args: {} };
  `)
  assert.equal(result.entries.find(e => e.name === 'Basic').disposition, 'unresolved-csf-filter')
})
