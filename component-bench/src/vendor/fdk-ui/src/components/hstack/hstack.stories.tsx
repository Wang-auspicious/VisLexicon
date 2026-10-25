import type { Meta, StoryObj } from '@storybook/react-vite';

import HStack from '.';

const meta: Meta<typeof HStack> = {
    component: HStack,
    title: 'HStack',
};

export default meta;
type Story = StoryObj<typeof HStack>;

const Item = ({ children }: { children: React.ReactNode }) => (
    <span
        style={{
            display: 'inline-block',
            padding: '0.25rem 0.5rem',
            background: '#EEF0F2',
            borderRadius: 4,
        }}
    >
        {children}
    </span>
);

export const Primary: Story = {
    render: () => (
        <div style={{ padding: '1rem' }}>
            <HStack>
                <Item>One</Item>
                <Item>Two</Item>
                <Item>Three</Item>
            </HStack>
        </div>
    ),
};


