export class UpdateCompanyDto {
  name?: string;
  address?: string;
  telephone_number?: string;
  email?: string;
  description?: string;
  image?: string;
  company_identification?: string | null;
  payment_preference?: "paypal" | "zelle" | "both";
}
