import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { useState } from 'react';

const meta: Meta<typeof Input> = {
  title: 'Components/Input',
  component: Input,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'radio', options: ['l', 'm'] },
    error: { control: 'boolean' },
    disabled: { control: 'boolean' },
    clearable: { control: 'boolean' },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Обертка для демонстрации filled states
const InputWithState = ({ defaultVal = '', ...args }: any) => {
  const [val, setVal] = useState(defaultVal);
  return (
    <div style={{ width: 300 }}>
      <Input
        {...args}
        value={val}
        onChange={(e) => setVal(e.target.value)}
      />
    </div>
  );
};

// --- Матрица состояний ---

export const Default: Story = {
  args: { label: 'Label', placeholder: 'Placeholder' },
};

export const Hover: Story = {
  args: { label: 'Label', placeholder: 'Placeholder' },
  parameters: { docs: { description: { story: 'Hover state (simulate with mouse)' } } },
};

export const Filled: Story = {
  render: () => <InputWithState label="Label" defaultVal="Description" clearable />,
};

export const FilledActive: Story = {
  render: () => <InputWithState label="Label" defaultVal="Description" clearable />,
  parameters: { docs: { description: { story: 'Focus state: White bg + Brand border' } } },
};

export const FilledError: Story = {
  render: () => <InputWithState label="Label" defaultVal="Description" error />,
};

export const DefaultError: Story = {
  args: { label: 'Label', error: true, placeholder: 'Placeholder' },
};

export const Disabled: Story = {
  args: { label: 'Label', disabled: true, value: 'Disabled text' },
};

// --- Размеры ---

export const SizeL: Story = {
  args: { size: 'l', label: 'Large Input', placeholder: 'Size L (60px)' },
};

export const SizeM: Story = {
  args: { size: 'm', label: 'Medium Input', placeholder: 'Size M (48px)' },
};