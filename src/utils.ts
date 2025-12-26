/*
 * @Author       : wfl
 * @LastEditors  : wfl
 * @description  :
 * @updateInfo   :
 * @Date         : 2025-12-25 17:34:51
 * @LastEditTime : 2025-12-26 16:00:00
 */
export interface HSV {
  h: number;
  s: number;
  v: number;
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface RGBA extends RGB {
  a: number;
}

export interface HSVA extends HSV {
  a: number;
}

export interface GradientStop {
  color: string;
  percent: number;
  id: string; // unique id for key
}

export interface GradientColor {
  type: 'linear' | 'radial';
  degree: number;
  stops: GradientStop[];
}

/**
 * HSV to RGB conversion
 * @param h Hue 0-360
 * @param s Saturation 0-1
 * @param v Value 0-1
 * @returns {r, g, b} 0-255
 */
export function hsv2rgb(h: number, s: number, v: number): RGB {
  h = (((h % 360) + 360) % 360) / 60;
  const i = Math.floor(h);
  const f = h - i;
  const p = v * (1 - s);
  const q = v * (1 - s * f);
  const t = v * (1 - s * (1 - f));

  let r = 0,
    g = 0,
    b = 0;
  switch (i) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * RGB to HSV conversion
 * @param r Red 0-255
 * @param g Green 0-255
 * @param b Blue 0-255
 * @returns {h, s, v} h:0-360, s:0-1, v:0-1
 */
export function rgb2hsv(r: number, g: number, b: number): HSV {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return { h: h * 360, s, v };
}

/**
 * RGB to Hex conversion
 * @param r Red
 * @param g Green
 * @param b Blue
 * @param a Alpha (optional) 0-1
 * @returns Hex string
 */
export function rgb2hex(r: number, g: number, b: number, a?: number): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  let hex = '#' + toHex(r) + toHex(g) + toHex(b);
  if (a !== undefined && a !== 1) {
    hex += toHex(a * 255);
  }
  return hex;
}

/**
 * Hex to RGB conversion
 * @param hex Hex string
 * @returns {r, g, b, a}
 */
export function hex2rgb(hex: string): RGBA | null {
  hex = hex.trim();
  if (hex.startsWith('#')) hex = hex.slice(1);

  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('');
  }
  if (hex.length === 4) {
    // #RGBA
    const r = hex[0]! + hex[0]!;
    const g = hex[1]! + hex[1]!;
    const b = hex[2]! + hex[2]!;
    const a = hex[3]! + hex[3]!;
    hex = r + g + b + a;
  }

  if (hex.length === 6) {
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: 1,
    };
  }

  if (hex.length === 8) {
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16),
      a: parseInt(hex.substring(6, 8), 16) / 255,
    };
  }

  return null;
}

/**
 * Parse any color string to HSVA
 * @param color Color string
 * @returns HSVA object
 */
export function parseColor(color: string): HSVA {
  if (!color) return { h: 0, s: 1, v: 1, a: 1 };

  if (color.includes('gradient')) {
    // Just return default if it's a gradient string (handled separately)
    return { h: 0, s: 1, v: 1, a: 1 };
  }

  // Handle Hex
  if (color.startsWith('#') || /^[0-9a-fA-F]{3,8}$/.test(color)) {
    const rgba = hex2rgb(color);
    if (rgba) {
      const hsv = rgb2hsv(rgba.r, rgba.g, rgba.b);
      return { ...hsv, a: rgba.a };
    }
  }

  // Handle RGB/RGBA
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1] ?? '0');
    const g = parseInt(rgbMatch[2] ?? '0');
    const b = parseInt(rgbMatch[3] ?? '0');
    const a = rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1;
    const hsv = rgb2hsv(r, g, b);
    return { ...hsv, a };
  }

  // Fallback
  return { h: 0, s: 1, v: 1, a: 1 };
}

/**
 * Parse gradient string (linear or radial)
 * e.g., "linear-gradient(90deg, #ff0000 0%, #0000ff 100%)"
 * e.g., "radial-gradient(circle at center, #ff0000 0%, #0000ff 100%)"
 */
export function parseGradient(str: string): GradientColor | null {
  if (!str) return null;
  const isLinear = str.includes('linear-gradient');
  const isRadial = str.includes('radial-gradient');
  
  if (!isLinear && !isRadial) return null;

  const type = isLinear ? 'linear' : 'radial';
  
  // Extract content inside parenthesis
  const startIndex = str.indexOf('(') + 1;
  const endIndex = str.lastIndexOf(')');
  let content = str.substring(startIndex, endIndex);
  
  let degree = 90;

  if (isLinear) {
    const degreeMatch = content.match(/(\d+)deg/);
    if (degreeMatch) {
      degree = parseInt(degreeMatch[1] ?? '90');
      content = content.replace(/(\d+)deg\s*,\s*/, '');
    }
  } else {
    // Radial: Remove shape/position definition if present
    // Simple heuristic: if starts with circle, ellipse, at, or side/corner keywords
    const configMatch = content.match(/^\s*(circle|ellipse|at\s|closest-|farthest-)[^,]+,\s*/);
    if (configMatch) {
      content = content.replace(configMatch[0], '');
    }
  }

  const parts = content.split(/,(?![^(]*\))/); // Split by comma not inside parens
  const stops: GradientStop[] = parts.map((part, index) => {
    part = part.trim();
    const percentMatch = part.match(/(\d+(?:\.\d+)?)%/);
    const percent = percentMatch
      ? parseFloat(percentMatch[1] ?? '0')
      : (index / (parts.length - 1)) * 100;
    const color = part.replace(/\s*\d+(?:\.\d+)?%/, '').trim();
    return {
      color,
      percent,
      id: Math.random().toString(36).substr(2, 9),
    };
  });

  return {
    type,
    degree,
    stops,
  };
}

export function formatGradient(grad: GradientColor): string {
  const stopsStr = [...grad.stops]
    .sort((a, b) => a.percent - b.percent)
    .map((s) => `${s.color} ${Number(s.percent).toFixed(2)}%`)
    .join(', ');
  
  if (grad.type === 'radial') {
    return `radial-gradient(circle at center, ${stopsStr})`;
  }
  return `linear-gradient(${grad.degree}deg, ${stopsStr})`;
}
