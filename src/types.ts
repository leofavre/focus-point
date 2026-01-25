export type StyleProps = {
  className?: string;
};

export type ObjectPositionString = `${string}% ${string}%`;

export type ObjectPositionObject = { x: number; y: number };

export type UploadedImage = {
  id: string;
  name: string;
  data: string;
  size: number;
  type: string;
  timestamp: number;
};
