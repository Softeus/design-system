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

    // Storybook built-in background toolbar
    backgrounds: {
      default: 'Light',
      values: [
        { name: 'Light', value: '#ffffff' },
        { name: 'Dark', value: '#1c1e22' },
      ],
    },
  },

  decorators: [
    (Story) => {
      const root = document.documentElement;

      // Storybook 10 built-in background tool stores the selection in URL:
      //   &globals=backgrounds.value:dark
      // context.globals.backgrounds is NOT set by the built-in tool (undefined).
      // We read the parent URL instead.
      try {
        const url = new URL(window.parent.location.href);
        const globals = url.searchParams.get('globals') || '';
        const theme = globals.includes(':dark') ? 'dark' : 'light';
        root.setAttribute('data-theme', theme);
      } catch {
        root.setAttribute('data-theme', 'light');
      }

      return <Story />;
    },
  ],
};

export default preview;
