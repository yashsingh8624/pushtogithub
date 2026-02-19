export interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  season: string;
  stock?: number;
  minimumOrder?: number;
}

export interface CartItem extends Product {
  qty: number;
}

export interface OrderDetails {
  name: string;
  phone: string;
  address: string;
}
