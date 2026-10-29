/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        app: '#F7F2EA',
        surface: '#FFFCF7',
        input: '#FFFFFF',
        line: '#E6DCCD',
        ink: '#2A2420',
        muted: '#6B6058',
        'muted-2': '#4A413A',
        'muted-3': '#8A7D70',
        accent: {
          DEFAULT: '#3E8E5E',
          dark: '#2F6E48',
          soft: '#E4EFE6',
        },
        sand: '#EFE6D8',
        danger: {
          DEFAULT: '#B4472B',
          soft: '#F6E1DA',
        },
        'disabled-bg': '#E6DCCD',
        'disabled-fg': '#8A7D70',
        dashed: '#CDBFAB',
        'toggle-off': '#CDBFAB',
        'verified-border': '#BFD9C7',
      },
      borderRadius: {
        input: '14px',
        card: '20px',
        stat: '16px',
        sheet: '24px',
        pill: '9999px',
      },
      fontFamily: {
        display: ['BricolageGrotesque_700Bold'],
        'display-medium': ['BricolageGrotesque_500Medium'],
        body: ['Figtree_400Regular'],
        'body-medium': ['Figtree_500Medium'],
        'body-semibold': ['Figtree_600SemiBold'],
      },
    },
  },
};

