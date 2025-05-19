export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // You can customize rules here if needed
    'body-max-line-length': [0, 'always'], // Disable line length limit for body
    'footer-max-line-length': [0, 'always'], // Disable line length limit for footer
  },
};
