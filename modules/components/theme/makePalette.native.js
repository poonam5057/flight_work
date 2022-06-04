const makePalette = colorScheme => {
  /* So far we're just storing the color scheme but in the future we can
   * use it to create a different palette */
  /* TODO: Gradient support for background, tripBackground, tripBorder, tripCardBackground */
  return {
    colorScheme,
    primary: '#40AFED',
    secondary: '#5AFFC7',
    accent: '#7CB518',
    text: '#F7F7F7',
    subTitle: '#FFC857',
    dark: '#323031',
    notification: '#ef5d08',
    disabled: '#949494',
    tableBackground: '#FFFFFF',
    selectedRow: '#DAEFFC',
    error: '#DB3A34',
    heading: '#D0D2D6',
    header: '#0D0A2E',
    // background: 'radial-gradient(123.22% 129.67% at 100.89% -5.6%, #201D47 0%, #17153A 100%)',
    background: '#17153A',
    border: '#FFFFFF99',
    surface: '#2B2955',
    fieldBackground: '#2B2955',
    placeholder: '#818C99',
    inactive: '#98A1BD',
    tripBackground:
      'linear-gradient(234.66deg, rgba(6, 136, 255, 0.098) -45.47%, rgba(52, 49, 102, 0.7) 57.27%);',
    tripBorder:
      'linear-gradient(134.45deg, #413E86 -77.32%, #312F62 38.66%, rgba(149, 145, 245, 0.55) 111.77%)',
    tripCardBackground:
      'linear-gradient(234.66deg, rgba(6, 136, 255, 0.098) -45.47%, rgba(28, 95, 183, 0.379745) 2.61%, rgba(52, 49, 102, 0.7) 57.27%)',
    toggleActive: '#312F62',
    toggleInactive: '#0C0A35',
    legLabel: '#FFC857',
    confirmationDialog: '#413E84',
    updated: '#7B61FF',
    ownerAccepted: '#CCFF00',
    accepted: '#0AFF4E',
    unsent: '#FB6107',
    rejected: '#FF001F',
  };
};

export default makePalette;
