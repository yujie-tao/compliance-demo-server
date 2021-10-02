function rgb_fromHex(arg_hex) {
  if (arg_hex.slice(0, 1) == '#') hex = arg_hex.slice(1);
  //  if the arg is "#0FA" it is converted to "#00FFAA"
  if (hex.length == 3) hex = hex.slice(0, 1) + hex.slice(0, 1) + hex.slice(1, 2) + hex.slice(1, 2) + hex.slice(2, 3) + hex.slice(2, 3);
  if (hex.length != 6) return NaN;
  return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map(function(str) {
    return parseInt(str, 16);
  });
}

function hsl_fromRGB(arg_rgb) {
  //todo: vadate the argument
  const rgb_f = arg_rgb.map(function(rgb_i) {
    return (rgb_i / 255)
  });
  const max = Math.max(...rgb_f);
  const min = Math.min(...rgb_f);
  const max_idx = rgb_f.indexOf(max);
  const diff = max - min;
  const h = (diff == 0 ? 0 : 60 * ((rgb_f[(max_idx + 1) % 3] - rgb_f[(max_idx + 2) % 3]) / diff) + 120 * max_idx); //[deg]
  const s = diff / (1 - (Math.abs(max + min - 1))) * 100; //[%]
  const l = (max + min) / 2 * 100; //[%]
  return [h, s, l];
}