import type { Meta, StoryObj } from '@storybook/react-vite';

import CopyButton from '.';

const meta: Meta<typeof CopyButton> = {
    component: CopyButton,
    title: 'CopyButton',
};

export default meta;
type Story = StoryObj<typeof CopyButton>;

export const Primary: Story = {
    parameters: {
        nextjs: {
            appDirectory: true,
        },
    },
    render: () => (
        <div style={{ padding: '1rem' }}>
            <CopyButton
                copyLabel={'Kopier'}
                copiedLabel={'Kopiert!'}
                copyOnClick={'Tekst å kopiere'}
            />
        </div>
    ),
};
