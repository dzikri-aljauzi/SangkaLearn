import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

// Sangkala brand palette (see docs/brand.md).
// Ramps are keyed by the stop numbers Tailwind already uses, so existing
// utility classes (bg-blue-600, text-gray-700, ...) resolve to brand colors.
const petrol = {
    50: '#EEF6F6',
    100: '#D9EBEC',
    200: '#B3D6D8',
    300: '#85BABD',
    400: '#4F9A9F',
    500: '#2A7C82',
    600: '#0D5C63', // primary
    700: '#0A4A50',
    800: '#083A3F',
    900: '#052A2E',
    950: '#052A2E',
};

// Warm neutral ramp. The brand defines 0/50/100/200/400/600/700/800/900;
// 300 is interpolated and 500 reuses 600 so secondary text keeps AA contrast.
const stone = {
    50: '#FCFCFB',
    100: '#F2F3F1',
    200: '#E3E5E2',
    300: '#C4C8C5',
    400: '#9AA09C',
    500: '#6B716E',
    600: '#6B716E',
    700: '#565C59',
    800: '#2C312F',
    900: '#17181A',
    950: '#17181A',
};

const sogan = {
    50: '#F3EADF',
    200: '#E2CDB0',
    600: '#8A5A2B',
    700: '#5C3B1B',
};

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            colors: {
                paper: '#FCFCFB',
                ink: '#17181A',
                petrol,
                sogan,
                // Hues outside the brand are folded into petrol so every
                // legacy class stays on-palette. Red/green/yellow/orange are
                // intentionally untouched: they carry status meaning.
                blue: petrol,
                indigo: petrol,
                violet: petrol,
                purple: petrol,
                fuchsia: petrol,
                pink: petrol,
                rose: petrol,
                cyan: petrol,
                sky: petrol,
                teal: petrol,
                gray: stone,
                slate: stone,
                zinc: stone,
                neutral: stone,
            },
            fontFamily: {
                sans: ['"IBM Plex Sans"', ...defaultTheme.fontFamily.sans],
                mono: ['"IBM Plex Mono"', ...defaultTheme.fontFamily.mono],
            },
        },
    },

    plugins: [forms],
};
