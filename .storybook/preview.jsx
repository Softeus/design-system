import '../src/styles/tokens.css';

/** @type { import('@storybook/react-vite').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // Настройка встроенного переключателя фона Storybook
    backgrounds: {
      default: 'light',
      values: [
        { name: 'Light', value: '#ffffff' },
        { name: 'Dark', value: '#1c1e22' },
      ],
    },
  },

  decorators: [
    (Story, context) => {
      const root = document.documentElement;

      // Читаем выбранный фон из глобалов аддона backgrounds
      const bg = context.globals.backgrounds;
      const color = typeof bg === 'string' ? bg : bg?.value;

      // Сопоставляем цвет фона с темой дизайн-системы
      const isDark = color === '#1c1e22';
      const theme = isDark ? 'dark' : 'light';

      root.setAttribute('data-theme', theme);

      return <Story />;
    },
  ],
};

export default preview;
