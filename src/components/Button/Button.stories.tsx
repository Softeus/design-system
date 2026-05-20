import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

// Иконки для демонстрации (можно заменить на свои)
const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor"/>
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['filled', 'secondary', 'outlined', 'ghost', 'link'],
      description: 'Вид кнопки',
    },
    size: {
      control: 'select',
      options: ['xl', 'l', 'm'],
      description: 'Размер кнопки',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Растянуть на всю ширину',
    },
    disabled: {
      control: 'boolean',
      description: 'Отключенное состояние',
    },
    iconPosition: {
      control: 'select',
      options: ['left', 'right'],
      description: 'Позиция иконки',
    },
    children: {
      control: 'text',
      description: 'Текст кнопки',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// ============ ДЕМОНСТРАЦИЯ ВИДОВ ============

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
      <Button variant="filled">Filled</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
};

// ============ КАЖДЫЙ ВИД ПО ОТДЕЛЬНОСТИ ============

export const Filled: Story = {
  args: {
    variant: 'filled',
    children: 'Filled Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Outlined: Story = {
  args: {
    variant: 'outlined',
    children: 'Outlined Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

// ============ РАЗМЕРЫ ============

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="xl">Size XL</Button>
      <Button size="l">Size L</Button>
      <Button size="m">Size M</Button>
    </div>
  ),
};

// ============ СОСТОЯНИЯ ============

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="filled">Default</Button>
      <Button variant="filled" disabled>Disabled</Button>
    </div>
  ),
};

// ============ ВСЕ СОСТОЯНИЯ ДЛЯ FILLED ============

export const FilledStates: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button variant="filled">Default</Button>
      <Button variant="filled" className="hover-demo">Hover (наведи)</Button>
      <Button variant="filled" className="active-demo">Active (зажми)</Button>
      <Button variant="filled" disabled>Disabled</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Hover и active состояния нужно смотреть в инспекторе или live-режиме Storybook',
      },
    },
  },
};

// ============ С ИКОНКАМИ ============

export const WithIconLeft: Story = {
  args: {
    variant: 'filled',
    icon: <StarIcon />,
    iconPosition: 'left',
    children: 'Button with Icon',
  },
};

export const WithIconRight: Story = {
  args: {
    variant: 'filled',
    icon: <StarIcon />,
    iconPosition: 'right',
    children: 'Button with Icon',
  },
};

export const IconOnly: Story = {
  args: {
    variant: 'filled',
    icon: <StarIcon />,
    'aria-label': 'Favorite',
  },
};

// ============ FULL WIDTH ============

export const FullWidth: Story = {
  args: {
    variant: 'filled',
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// ============ ВСЕ ВАРИАНТЫ С ИКОНКАМИ ============

export const AllVariantsWithIcon: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Button variant="filled" icon={<StarIcon />}>Filled</Button>
        <Button variant="secondary" icon={<StarIcon />}>Secondary</Button>
        <Button variant="outlined" icon={<StarIcon />}>Outlined</Button>
        <Button variant="ghost" icon={<StarIcon />}>Ghost</Button>
        <Button variant="link" icon={<StarIcon />}>Link</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Button variant="filled" icon={<StarIcon />} iconPosition="right">Icon Right</Button>
        <Button variant="filled" icon={<StarIcon />} size="xl">Size XL</Button>
        <Button variant="filled" icon={<StarIcon />} size="l">Size L</Button>
        <Button variant="filled" icon={<StarIcon />} size="m">Size M</Button>
      </div>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <Button variant="filled" icon={<StarIcon />} disabled>Disabled</Button>
        <Button variant="filled" icon={<StarIcon />} fullWidth>Full Width</Button>
      </div>
    </div>
  ),
};

// ============ КВАДРАТНЫЕ КНОПКИ (ТОЛЬКО ИКОНКА) ============

export const IconOnlyButtons: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Button variant="filled" icon={<StarIcon />} size="xl" aria-label="XL Icon" />
      <Button variant="filled" icon={<StarIcon />} size="l" aria-label="L Icon" />
      <Button variant="filled" icon={<StarIcon />} size="m" aria-label="M Icon" />
      <Button variant="secondary" icon={<StarIcon />} size="m" aria-label="Secondary" />
      <Button variant="outlined" icon={<StarIcon />} size="m" aria-label="Outlined" />
      <Button variant="ghost" icon={<StarIcon />} size="m" aria-label="Ghost" />
    </div>
  ),
};