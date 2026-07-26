export type Variant = {
  id: string;
  label: string | null;
  chipIcon: string | null;
  image: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
};

export type Product = {
  id: string;
  stepId: string;
  reviewCategory: 'Cameras' | 'Sensors' | 'Accessories' | 'Plan';
  title: string;
  description: string;
  image: string;
  learnMoreUrl: string;
  badge: string | null;
  requiredLabel?: string;
  selectionType: 'quantity' | 'plan';
  minQuantity: number;
  hasVariants: boolean;
  activeVariantId: string;
  variants: Variant[];
};

export type Step = {
  id: string;
  order: number;
  title: string;
  icon: string;
};
