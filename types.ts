
export interface Trip {
  id: string;
  date: string;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  altText?: string;
  altText?: string;
  isConsultPrice?: boolean;
  detailedItinerary?: string;
}

export interface Park {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  rating: number;
}

export interface Testimonial {
  id: string;
  userHandle: string;
  avatarUrl: string;
  text: string;
}

export interface PolaroidPhoto {
  id: string;
  caption: string;
  imageUrl: string;
  rotationClass: string;
}
