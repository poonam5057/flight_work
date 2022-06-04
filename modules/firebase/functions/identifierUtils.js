const range = (begin, end) =>
  Array.from({ length: end - begin + 1 }, (_, i) => begin + i);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1) + min);

// 0-9, A-H, J-N, P-Z
const validIdentifierCharCodes = [
  range(48, 57),
  range(65, 72),
  range(74, 78),
  range(80, 90),
].flat();

exports.generateIdentifier = function generateIdentifier() {
  const first = String.fromCharCode(validIdentifierCharCodes[randomInt(0, 33)]);
  const second =
    first >= 'A'
      ? randomInt(0, 9)
      : String.fromCharCode(validIdentifierCharCodes[randomInt(0, 33)]);
  const third =
    second >= 'A'
      ? randomInt(0, 9)
      : String.fromCharCode(validIdentifierCharCodes[randomInt(0, 33)]);
  const fourth =
    third >= 'A'
      ? randomInt(0, 9)
      : String.fromCharCode(validIdentifierCharCodes[randomInt(0, 33)]);
  return fourth + third + second + first;
};
