import parsePhoneNumber from 'libphonenumber-js/mobile';

export const parse = (text, country = 'US') => parsePhoneNumber(text, country);
