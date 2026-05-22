import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './Input';
import { useState } from 'react';

/* ── Password eye icons ──────────────────────────── */

const EyeOpenIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M17.94 17.94C15.93 19.24 13.97 20 12 20C5 20 1 12 1 12C2.77 8.55 5.1 6.56 7.33 5.28M9.88 4.29C10.57 4.1 11.29 4 12 4C19 4 23 12 23 12C22.3 13.5 21.33 14.9 20.14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M1 1L23 23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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

// --- Парольный инпут ---

export const Password: Story = {
  render: () => {
    const [val, setVal] = useState('');
    const [shown, setShown] = useState(false);
    return (
      <div style={{ width: 300 }}>
        <Input
          label="Пароль"
          type={shown ? 'text' : 'password'}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder="············"
          size="l"
          trailingIcon={shown ? <EyeClosedIcon /> : <EyeOpenIcon />}
          onTrailingIconClick={() => setShown((p) => !p)}
          trailingIconLabel={shown ? 'Скрыть пароль' : 'Показать пароль'}
          autoComplete="current-password"
        />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Парольный инпут с иконкой показа/скрытия пароля внутри поля. Использует пропы `trailingIcon`, `onTrailingIconClick` и `trailingIconLabel`.',
      },
    },
  },
};