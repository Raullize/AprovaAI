export interface Plan {
  id: string;
  name: string;
  price?: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  ctaText: string;
  ctaVariant: 'primary' | 'secondary' | 'outline';
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
} 