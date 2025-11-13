import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { quoteSchema, QuoteFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { useSupabaseMutation } from "@/hooks/useSupabaseQuery";
import MobileNav from "@/components/MobileNav";

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

const QuoteForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [previousStatus, setPreviousStatus] = useState<string>("");

  const form = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: "",
      depositPercentage: "",
      clientId: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchClients();
      if (id) {
        fetchQuote();
      }
    }
  }, [id, user]);

  const fetchClients = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("clients")
        .select("id, first_name, last_name")
        .eq("user_id", user.id)
        .order("first_name");

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoadingClients(false);
    }
  };

  const fetchQuote = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from("quotes")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        const status = data.status as "draft" | "sent" | "accepted" | "rejected";
        setPreviousStatus(status || "draft");
        form.reset({
          title: data.title || "",
          description: data.description || "",
          amount: data.amount?.toString() || "",
          depositPercentage: data.deposit_percentage?.toString() || "",
          clientId: data.client_id || "",
          status: status || "draft",
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement du devis");
      navigate("/quotes");
    }
  };

  // Fonction pour créer automatiquement un chantier depuis un devis accepté
  const createSiteFromQuote = async (quoteId: string, quoteData: any) => {
    if (!user) return;

    // Vérifier si un chantier existe déjà pour ce devis
    const { data: existingSite } = await supabase
      .from("sites")
      .select("id")
      .eq("quote_id", quoteId)
      .eq("user_id", user.id)
      .single();

    if (existingSite) {
      // Un chantier existe déjà, ne pas en créer un nouveau
      return;
    }

    // Créer le chantier automatiquement
    const { error: siteError } = await supabase
      .from("sites")
      .insert({
        user_id: user.id,
        client_id: quoteData.client_id,
        quote_id: quoteId,
        title: quoteData.title,
        description: quoteData.description,
        status: "active",
        start_date: new Date().toISOString(),
        total_amount: quoteData.amount,
        paid_amount: quoteData.deposit_amount || 0,
      });

    if (siteError) {
      console.error("Erreur lors de la création du chantier:", siteError);
      toast.error("Devis accepté mais erreur lors de la création du chantier");
    } else {
      toast.success("Devis accepté et chantier créé automatiquement !");
    }
  };

  const onSubmit = async (values: QuoteFormData) => {
    if (!user) return;

    try {
      const amount = parseFloat(values.amount);
      const depositPercentage = values.depositPercentage ? parseFloat(values.depositPercentage) : null;
      const depositAmount = depositPercentage ? (amount * depositPercentage) / 100 : null;

      const quoteData = {
        title: values.title,
        description: values.description,
        amount,
        deposit_percentage: depositPercentage,
        deposit_amount: depositAmount,
        client_id: values.clientId,
        status: values.status,
        user_id: user.id,
      };

      if (id) {
        // Mise à jour d'un devis existant
        const { error, data } = await supabase
          .from("quotes")
          .update(quoteData)
          .eq("id", id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;

        // Si le statut passe à "accepted" et qu'il ne l'était pas avant
        if (values.status === "accepted" && previousStatus !== "accepted" && id) {
          await createSiteFromQuote(id, quoteData);
        }

        toast.success("Devis modifié avec succès");
      } else {
        // Création d'un nouveau devis
        const { error, data } = await supabase
          .from("quotes")
          .insert([quoteData])
          .select()
          .single();

        if (error) throw error;

        // Si le devis est créé directement avec le statut "accepted"
        if (values.status === "accepted" && data) {
          await createSiteFromQuote(data.id, quoteData);
        }

        toast.success("Devis créé avec succès");
      }

      navigate("/quotes");
    } catch (error: any) {
      toast.error("Une erreur est survenue");
    }
  };

  if (loading || loadingClients) {
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
          onClick={() => navigate("/quotes")}
          className="mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Modifier le devis" : "Nouveau devis"}
        </h1>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations du devis</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
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
                      <FormLabel>Titre du devis</FormLabel>
                      <FormControl>
                        <Input placeholder="Rénovation salle de bain" {...field} />
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
                          placeholder="Détails des travaux à effectuer..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant total (€)</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder="5000.00"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Format: 1000 ou 1000.50
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="depositPercentage"
                  render={({ field }) => {
                    const amount = form.watch("amount");
                    const depositPercentage = field.value ? parseFloat(field.value) : 0;
                    const depositAmount = amount && depositPercentage > 0 
                      ? (parseFloat(amount) * depositPercentage) / 100 
                      : 0;

                    return (
                      <FormItem>
                        <FormLabel>Acompte (%) - Optionnel</FormLabel>
                        <FormControl>
                          <Input
                            type="text"
                            placeholder="30"
                            {...field}
                          />
                        </FormControl>
                        {amount && depositPercentage > 0 && (
                          <FormDescription className="text-primary font-medium">
                            Montant de l'acompte : {depositAmount.toFixed(2)}€
                          </FormDescription>
                        )}
                        {!amount && depositPercentage > 0 && (
                          <FormDescription>
                            Entrez d'abord le montant total pour voir l'acompte
                          </FormDescription>
                        )}
                        {!depositPercentage && (
                          <FormDescription>
                            Pourcentage de l'acompte (0-100)
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => {
                    const status = field.value;
                    const willCreateSite = status === "accepted" && previousStatus !== "accepted";

                    return (
                      <FormItem>
                        <FormLabel>Statut</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="draft">Brouillon</SelectItem>
                            <SelectItem value="sent">Envoyé</SelectItem>
                            <SelectItem value="accepted">Accepté</SelectItem>
                            <SelectItem value="rejected">Refusé</SelectItem>
                          </SelectContent>
                        </Select>
                        {willCreateSite && (
                          <FormDescription className="text-success font-medium">
                            ✓ Un chantier sera créé automatiquement si le devis est accepté
                          </FormDescription>
                        )}
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <div className="space-y-2">
                  {form.watch("amount") && form.watch("depositPercentage") && parseFloat(form.watch("depositPercentage") || "0") > 0 && (
                    <Card className="bg-muted/50">
                      <CardContent className="p-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Montant total:</span>
                          <span className="font-bold">{parseFloat(form.watch("amount") || "0").toFixed(2)}€</span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">Acompte ({form.watch("depositPercentage")}%):</span>
                          <span className="font-bold text-primary">
                            {((parseFloat(form.watch("amount") || "0") * parseFloat(form.watch("depositPercentage") || "0")) / 100).toFixed(2)}€
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1 border-t pt-1">
                          <span className="text-muted-foreground">Reste à payer:</span>
                          <span className="font-bold">
                            {(parseFloat(form.watch("amount") || "0") - (parseFloat(form.watch("amount") || "0") * parseFloat(form.watch("depositPercentage") || "0")) / 100).toFixed(2)}€
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? "Chargement..." : id ? "Modifier" : "Créer"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default QuoteForm;
