import { z } from "zod";

// Schéma de validation pour les clients
export const clientSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  phone: z
    .string()
    .trim()
    .regex(
      /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/,
      "Le numéro de téléphone doit être au format français valide"
    ),
  email: z
    .string()
    .trim()
    .email("L'adresse email n'est pas valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  address: z
    .string()
    .trim()
    .min(5, "L'adresse doit contenir au moins 5 caractères")
    .max(500, "L'adresse ne peut pas dépasser 500 caractères"),
});

export type ClientFormData = z.infer<typeof clientSchema>;

// Schéma de validation pour l'inscription
export const signUpSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .max(50, "Le prénom ne peut pas dépasser 50 caractères"),
  lastName: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(50, "Le nom ne peut pas dépasser 50 caractères"),
  email: z
    .string()
    .trim()
    .email("L'adresse email n'est pas valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères"),
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

// Schéma de validation pour la connexion
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("L'adresse email n'est pas valide")
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  password: z
    .string()
    .min(1, "Le mot de passe est requis")
    .max(100, "Le mot de passe ne peut pas dépasser 100 caractères"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Schéma de validation pour les devis
export const quoteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(100, "Le titre ne peut pas dépasser 100 caractères"),
  description: z
    .string()
    .trim()
    .min(10, "La description doit contenir au moins 10 caractères")
    .max(2000, "La description ne peut pas dépasser 2000 caractères"),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Le montant doit être un nombre valide (ex: 1000 ou 1000.50)")
    .refine((val) => parseFloat(val) > 0, "Le montant doit être supérieur à 0")
    .refine((val) => parseFloat(val) <= 999999.99, "Le montant ne peut pas dépasser 999 999,99 €"),
  depositPercentage: z
    .string()
    .optional()
    .refine(
      (val) => !val || (parseFloat(val) >= 0 && parseFloat(val) <= 100),
      "Le pourcentage doit être entre 0 et 100"
    ),
  clientId: z
    .string()
    .uuid("Veuillez sélectionner un client valide"),
  status: z.enum(["draft", "sent", "accepted", "rejected"], {
    errorMap: () => ({ message: "Statut invalide" }),
  }),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

