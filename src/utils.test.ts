import { parseGradient, formatGradient, type GradientColor } from './utils';

describe('utils: Gradient', () => {
  describe('parseGradient', () => {
    it('should return null for invalid strings', () => {
      expect(parseGradient('')).toBeNull();
      expect(parseGradient('#fff')).toBeNull();
      expect(parseGradient('rgb(0,0,0)')).toBeNull();
    });

    it('should parse linear-gradient correctly', () => {
      const str = 'linear-gradient(90deg, #ff0000 0%, #0000ff 100%)';
      const result = parseGradient(str);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('linear');
      expect(result!.degree).toBe(90);
      expect(result!.stops).toHaveLength(2);
      expect(result!.stops[0]!.color).toBe('#ff0000');
      expect(result!.stops[0]!.percent).toBe(0);
      expect(result!.stops[1]!.color).toBe('#0000ff');
      expect(result!.stops[1]!.percent).toBe(100);
    });

    it('should parse radial-gradient correctly', () => {
      const str = 'radial-gradient(circle at center, #ff0000 0%, #0000ff 100%)';
      const result = parseGradient(str);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('radial');
      // Degree is irrelevant for radial but might default to 90
      expect(result!.stops).toHaveLength(2);
      expect(result!.stops[0]!.color).toBe('#ff0000');
      expect(result!.stops[0]!.percent).toBe(0);
    });

    it('should parse simple radial-gradient without config', () => {
      const str = 'radial-gradient(#ff0000 0%, #0000ff 100%)';
      const result = parseGradient(str);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('radial');
      expect(result!.stops).toHaveLength(2);
    });

    it('should parse radial-gradient with other keywords', () => {
      const str = 'radial-gradient(ellipse at top left, red 0%, blue 100%)';
      const result = parseGradient(str);
      expect(result).not.toBeNull();
      expect(result!.type).toBe('radial');
      expect(result!.stops).toHaveLength(2);
      expect(result!.stops[0]!.color).toBe('red');
    });
  });

  describe('formatGradient', () => {
    it('should format linear-gradient correctly', () => {
      const grad: GradientColor = {
        type: 'linear',
        degree: 180,
        stops: [
          { color: 'red', percent: 0, id: '1' },
          { color: 'blue', percent: 100, id: '2' },
        ],
      };
      const str = formatGradient(grad);
      expect(str).toBe('linear-gradient(180deg, red 0.00%, blue 100.00%)');
    });

    it('should format radial-gradient correctly', () => {
      const grad: GradientColor = {
        type: 'radial',
        degree: 90, // Ignored
        stops: [
          { color: 'red', percent: 0, id: '1' },
          { color: 'blue', percent: 100, id: '2' },
        ],
      };
      const str = formatGradient(grad);
      // Our implementation currently enforces "circle at center" for output
      expect(str).toBe('radial-gradient(circle at center, red 0.00%, blue 100.00%)');
    });
  });
});
