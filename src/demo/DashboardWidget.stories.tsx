import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '../components/Button/Button';
import { Input } from '../components/Input/Input';
import styles from './DashboardWidget.module.css';

/* ── Types ────────────────────────────────────────── */

type Status = 'error' | 'success' | 'pending' | 'overdue';

interface InvoiceItem {
  id: string;
  status: Status;
  title: string;
}

/* ── Icons ────────────────────────────────────────── */

const SearchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EditIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M17 3L21 7L7 21H3V17L17 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ── Data ─────────────────────────────────────────── */

const defaultItems: InvoiceItem[] = [
  { id: 'INV-2024-0891', status: 'error',   title: 'Ошибка валидации' },
  { id: 'CALC-2024-0882', status: 'success', title: 'Расчёт завершён' },
  { id: 'APPR-2024-0870', status: 'pending', title: 'Ожидает подтверждения' },
  { id: 'INV-2024-0863', status: 'overdue', title: 'Просроченный платёж' },
  { id: 'INV-2024-0855', status: 'success', title: 'Расчёт завершён' },
  { id: 'CALC-2024-0841', status: 'error',   title: 'Ошибка в данных' },
];

/* ── CSS class maps by status ─────────────────────── */

const accentClass: Record<Status, string> = {
  error:   styles['cardAccent--error'],
  success: styles['cardAccent--success'],
  pending: styles['cardAccent--pending'],
  overdue: styles['cardAccent--overdue'],
};

const dotClass: Record<Status, string> = {
  error:   styles['statusDot--error'],
  success: styles['statusDot--success'],
  pending: styles['statusDot--pending'],
  overdue: styles['statusDot--overdue'],
};

/* ── Widget Component ─────────────────────────────── */

interface DashboardWidgetProps {
  initialItems: InvoiceItem[];
}

const DashboardWidget = ({ initialItems }: DashboardWidgetProps) => {
  const [search, setSearch] = useState('');

  const q = search.toLowerCase().trim();
  const filtered = q
    ? initialItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q)
      )
    : initialItems;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.title}>📋 Последние заявки</h2>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по ID или названию"
            clearable
            size="m"
          />
      </div>

      {/* List */}
      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.emptyState}>
            {q ? 'Ничего не найдено' : 'Нет заявок'}
          </div>
        ) : (
          filtered.map((item) => (
            <div key={item.id} className={styles.card}>
              {/* Left accent */}
              <div
                className={`${styles.cardAccent} ${accentClass[item.status]}`}
              />

              {/* Content */}
              <div className={styles.cardContent}>
                <div className={styles.cardTitleRow}>
                  <span className={`${styles.statusDot} ${dotClass[item.status]}`} />
                  <span className={styles.cardTitle} title={item.title}>
                    {item.title}
                  </span>
                </div>
                <div className={styles.cardId}>{item.id}</div>
              </div>

              {/* Actions */}
              <div className={styles.cardActions}>
                <Button
                  variant="ghost"
                  size="m"
                  icon={<EditIcon />}
                  aria-label={`Редактировать ${item.id}`}
                />
                <Button
                  variant="ghost"
                  size="m"
                  icon={<CloseIcon />}
                  aria-label={`Удалить ${item.id}`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <Button variant="link" fullWidth>
          Показать все {initialItems.length}
        </Button>
        <Button variant="filled" fullWidth icon={<PlusIcon />}>
          Создать заявку
        </Button>
      </div>
    </div>
  );
};

DashboardWidget.displayName = 'DashboardWidget';

/* ── Meta ─────────────────────────────────────────── */

const meta: Meta<typeof DashboardWidget> = {
  title: 'Demo/DashboardWidget',
  component: DashboardWidget,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    initialItems: {
      control: 'object',
      description: 'Массив заявок для отображения',
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashboardWidget>;

/* ── Stories ──────────────────────────────────────── */

export const Default: Story = {
  args: {
    initialItems: defaultItems,
  },
};

export const Dark: Story = {
  args: {
    initialItems: defaultItems,
  },
  parameters: {
    backgrounds: { default: 'Dark' },
  },
};

export const Empty: Story = {
  args: {
    initialItems: [],
  },
};

export const SingleItem: Story = {
  args: {
    initialItems: [defaultItems[0]],
  },
};
