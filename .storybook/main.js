/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  "stories": [
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "@storybook/addon-backgrounds"
  ],
  "framework": "@storybook/react-vite"
};
export default config;
