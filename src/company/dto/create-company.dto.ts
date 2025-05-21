export class CreateCompanyDto {
  name: string;
  address: string;
  telephone_number?: string;
  email?: string;
  description?: string;
  image?: string;
  payment_preference?: "paypal" | "zelle" | "both";
}
