const makePalette = colorScheme => {
  /* So far we're just storing the color scheme but in the future we can
   * use it to create a different palette */
  return {
    colorScheme,
    primary: '#40AFED',
    secondary: '#5AFFC7',
    accent: '#7CB518',
    highlight: '#FFC857',
    text: '#6E6E6E',
    dark: '#323031',
    background: '#F7F7F7',
    notification: '#ef5d08',
    disabled: '#949494',
    tableBackground: '#FFFFFF',
    selectedRow: '#DAEFFC',
    error: '#DB3A34',
    heading: '#D0D2D6',
    header: '#0D0A2E',
    fieldBackground: '#2B2955',
    placeholder: '#818C99',
    inactive: '#98A1BD',
    accepted: '#7CB518',
    updated: '#7B61FF',
  };
};

export default makePalette;
