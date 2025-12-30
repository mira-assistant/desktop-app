export interface PersonColor {
    background: string;
    border: string;
    text: string;
  }

  const greenShades: PersonColor[] = [
    { background: '#f0fffa', border: '#00ff88', text: '#00cc6a' },
    { background: '#e6fffa', border: '#00e074', text: '#00b359' },
    { background: '#dcfdf7', border: '#00d15a', text: '#009944' },
    { background: '#d1fae5', border: '#00c249', text: '#007f30' },
  ];

  export function getPersonColor(personIndex: number): PersonColor {
    return greenShades[personIndex % greenShades.length];
  }