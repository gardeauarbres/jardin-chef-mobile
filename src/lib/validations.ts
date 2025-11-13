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
