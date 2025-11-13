import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseMutation } from "@/hooks/useSupabaseQuery";
import MobileNav from "@/components/MobileNav";
import { PhotoGallery } from "@/components/PhotoGallery";

const siteSchema = z.object({
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
  clientId: z.string().uuid("Veuillez sélectionner un client valide"),
  quoteId: z.string().uuid("Veuillez sélectionner un devis valide"),
  status: z.enum(["active", "completed", "paused"]),
  startDate: z.string().min(1, "La date de début est requise"),
  endDate: z.string().optional(),
  totalAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Le montant doit être un nombre valide")
    .refine((val) => parseFloat(val) > 0, "Le montant doit être supérieur à 0"),
  paidAmount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Le montant payé doit être un nombre valide")
    .refine((val) => parseFloat(val) >= 0, "Le montant payé doit être positif"),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

interface Quote {
  id: string;
  title: string;
  amount: number;
  status: string;
}

const SiteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      title: "",
      description: "",
      clientId: "",
      quoteId: "",
      status: "active",
      startDate: new Date().toISOString().split("T")[0],
      endDate: "",
      totalAmount: "",
      paidAmount: "0",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
      if (id) {
        fetchSite();
      }
    }
  }, [id, user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [clientsRes, quotesRes] = await Promise.all([
        supabase
          .from("clients")
          .select("id, first_name, last_name")
          .eq("user_id", user.id)
          .order("first_name"),
        supabase
          .from("quotes")
          .select("id, title, amount, status")
          .eq("user_id", user.id)
          .in("status", ["accepted"])
          .order("created_at", { ascending: false }),
      ]);

      if (clientsRes.error) throw clientsRes.error;
      if (quotesRes.error) throw quotesRes.error;

      setClients(clientsRes.data || []);
      setQuotes(quotesRes.data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchSite = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from("sites")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          title: data.title || "",
          description: data.description || "",
          clientId: data.client_id || "",
          quoteId: data.quote_id || "",
          status: data.status as "active" | "completed" | "paused",
          startDate: data.start_date ? new Date(data.start_date).toISOString().split("T")[0] : "",
          endDate: data.end_date ? new Date(data.end_date).toISOString().split("T")[0] : "",
          totalAmount: data.total_amount?.toString() || "",
          paidAmount: data.paid_amount?.toString() || "0",
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement du chantier");
      navigate("/sites");
    }
  };

  // Quand un devis est sélectionné, remplir automatiquement les champs
  const handleQuoteChange = (quoteId: string) => {
    const quote = quotes.find((q) => q.id === quoteId);
    if (quote) {
      form.setValue("title", quote.title);
      form.setValue("totalAmount", quote.amount.toString());
      // Trouver le client associé au devis
      supabase
        .from("quotes")
        .select("client_id")
        .eq("id", quoteId)
        .single()
        .then(({ data }) => {
          if (data) {
            form.setValue("clientId", data.client_id);
          }
        });
    }
  };

  const onSubmit = async (values: SiteFormData) => {
    if (!user) return;

    try {
      const siteData = {
        user_id: user.id,
        client_id: values.clientId,
        quote_id: values.quoteId,
        title: values.title,
        description: values.description,
        status: values.status,
        start_date: new Date(values.startDate).toISOString(),
        end_date: values.endDate ? new Date(values.endDate).toISOString() : null,
        total_amount: parseFloat(values.totalAmount),
        paid_amount: parseFloat(values.paidAmount),
      };

      if (id) {
        const { error } = await supabase
          .from("sites")
          .update(siteData)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Chantier modifié avec succès");
        navigate("/sites");
      } else {
        const { data, error } = await supabase.from("sites").insert([siteData]).select().single();

        if (error) throw error;
        toast.success("Chantier créé avec succès");
        // Rediriger vers la page d'édition pour pouvoir ajouter des photos
        if (data?.id) {
          navigate(`/sites/${data.id}`);
        } else {
          navigate("/sites");
        }
      }
    } catch (error: any) {
      toast.error("Une erreur est survenue");
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-primary text-primary-foreground p-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/sites")}
          className="mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Modifier le chantier" : "Nouveau chantier"}
        </h1>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations du chantier</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="quoteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devis associé</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleQuoteChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Sélectionner un devis accepté" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[60vh]">
                          {quotes.map((quote) => (
                            <SelectItem key={quote.id} value={quote.id} className="text-base py-3">
                              {quote.title} - {quote.amount.toFixed(2)}€
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Sélectionnez un devis accepté pour pré-remplir les informations
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="text-base">
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[60vh]">
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id} className="text-base py-3">
                              {client.first_name} {client.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titre du chantier</FormLabel>
                      <FormControl>
                        <Input placeholder="Rénovation jardin" className="text-base" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Détails des travaux..."
                          className="min-h-[120px] text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de début</FormLabel>
                        <FormControl>
                          <Input type="date" className="text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de fin (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="date" className="text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant total (€)</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="decimal" step="0.01" placeholder="5000.00" className="text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paidAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Montant payé (€)</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="decimal" step="0.01" placeholder="0" className="text-base" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="text-base">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="active" className="text-base py-3">En cours</SelectItem>
                            <SelectItem value="completed" className="text-base py-3">Terminé</SelectItem>
                            <SelectItem value="paused" className="text-base py-3">En pause</SelectItem>
                          </SelectContent>
                        </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full min-h-[44px] text-base" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Chargement..." : id ? "Modifier" : "Créer"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Galerie photo - seulement en mode édition */}
        {id ? (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <PhotoGallery siteId={id} />
            </CardContent>
          </Card>
        ) : (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <p className="mb-2">Créez d'abord le chantier pour ajouter des photos</p>
                <p className="text-sm">Après la création, vous pourrez uploader des photos</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <MobileNav />
    </div>
  );
};

export default SiteForm;

