import { createTheme } from '@mui/material/styles';

// ---------------------------------------------------------------------------------------------
// THE palette. Defined ONCE here, then used by
//   1. MUI           -> createTheme() below
//   2. custom CSS    -> applyPaletteCssVariables() writes them as --pop-* CSS variables on :root,
//                       and index.css / App.css only ever use var(--pop-...)
//   3. Bootstrap     -> index.css maps the Bootstrap buttons / links / forms onto the same variables
// ---------------------------------------------------------------------------------------------
export const palette = {
    green300: '#A8D5BA',   // sage / mint  (primary)
    green100: '#CFE8D5',   // light mint   (soft backgrounds, hover)
    green500: '#6FAE88',   // deeper sage  (accents, focus rings, chart lines)
    green700: '#4C8A66',   // darkest sage (links on cream)
    beige100: '#F5EFE6',   // cream        (page background)
    beige300: '#E8DCC8',   // beige        (borders, cards, secondary)
    beige500: '#D3BFA0',   // deeper beige (hover on secondary)
    text: '#3F5B4A',       // soft dark green text
    textMuted: '#6B8576',
    white: '#FFFFFF',
    danger: '#C96B6B',     // muted rose - destructive actions
    warning: '#D9A441',    // honey - low stock
    success: '#2E7D4F',
};

// colours for multi series charts (recharts)
export const chartColors = [palette.green500, '#D9A441', '#8FB9C9', '#C99AA6', palette.green300, palette.beige500, '#9E9AC8', '#E0B08A'];

export const applyPaletteCssVariables = () => {
    const root = document.documentElement;
    // palette.green300 -> var(--pop-green300), palette.textMuted -> var(--pop-textMuted)
    Object.entries(palette).forEach(([key, value]) => root.style.setProperty(`--pop-${key}`, value));
    root.style.setProperty('--pop-radius', '18px');
    root.style.setProperty('--pop-radius-sm', '12px');
    root.style.setProperty('--pop-shadow', '0 6px 20px rgba(63, 91, 74, 0.10)');
    root.style.setProperty('--pop-shadow-hover', '0 12px 28px rgba(63, 91, 74, 0.18)');
    root.style.setProperty('--pop-font', "'Quicksand', 'Segoe UI', sans-serif");
    root.style.setProperty('--pop-font-heading', "'Fredoka', 'Quicksand', sans-serif");
};

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: { main: palette.green300, light: palette.green100, dark: palette.green500, contrastText: palette.text },
        secondary: { main: palette.beige300, light: palette.beige100, dark: palette.beige500, contrastText: palette.text },
        success: { main: palette.success },
        warning: { main: palette.warning },
        error: { main: palette.danger },
        background: { default: palette.beige100, paper: palette.white },
        text: { primary: palette.text, secondary: palette.textMuted },
        divider: palette.beige300,
    },
    shape: { borderRadius: 14 },
    typography: {
        fontFamily: "'Quicksand', 'Segoe UI', sans-serif",
        h1: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 600 },
        h2: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 600 },
        h3: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 600 },
        h4: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 600 },
        h5: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 500 },
        h6: { fontFamily: "'Fredoka', 'Quicksand', sans-serif", fontWeight: 500 },
        button: { textTransform: 'none', fontWeight: 700 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
            styleOverrides: {
                root: { borderRadius: 999, paddingInline: 20 },
                containedPrimary: { '&:hover': { backgroundColor: palette.green500, color: palette.white } },
            },
        },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        MuiChip: { styleOverrides: { root: { fontWeight: 700 } } },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    backgroundColor: palette.white,
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.green500 },
                },
                notchedOutline: { borderColor: palette.beige300 },
            },
        },
        MuiDataGrid: {
            styleOverrides: {
                root: {
                    border: `1px solid ${palette.beige300}`,
                    borderRadius: 18,
                    backgroundColor: palette.white,
                    '--DataGrid-t-header-background-base': palette.green100,
                    '--DataGrid-t-color-background-base': palette.white,
                },
                columnHeaders: { fontWeight: 700 },
            },
        },
    },
});

export default theme;
