import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "@/components/MobileNav";

const paymentSchema = z.object({
  siteId: z.string().uuid("Veuillez sélectionner un chantier valide"),
  clientId: z.string().uuid("Veuillez sélectionner un client valide"),
  amount: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Le montant doit être un nombre valide")
    .refine((val) => parseFloat(val) > 0, "Le montant doit être supérieur à 0"),
  type: z.enum(["deposit", "progress", "final"]),
  status: z.enum(["pending", "paid"]),
  dueDate: z.string().optional(),
  paidDate: z.string().optional(),
}).refine((data) => {
  // Si le statut est "paid", la date de paiement est requise
  if (data.status === "paid" && !data.paidDate) {
    return false;
  }
  return true;
}, {
  message: "La date de paiement est requise lorsque le statut est 'Payé'",
  path: ["paidDate"],
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface Site {
  id: string;
  title: string;
  client_id: string;
  total_amount: number;
  paid_amount: number;
}

interface Client {
  id: string;
  first_name: string;
  last_name: string;
}

const PaymentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, loading } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      siteId: "",
      clientId: "",
      amount: "",
      type: "deposit",
      status: "pending",
      dueDate: "",
      paidDate: "",
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
        fetchPayment();
      }
    }
  }, [id, user]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [sitesRes, clientsRes] = await Promise.all([
        supabase
          .from("sites")
          .select("id, title, client_id, total_amount, paid_amount")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("clients")
          .select("id, first_name, last_name")
          .eq("user_id", user.id)
          .order("first_name"),
      ]);

      if (sitesRes.error) throw sitesRes.error;
      if (clientsRes.error) throw clientsRes.error;

      setSites(sitesRes.data || []);
      setClients(clientsRes.data || []);
    } catch (error: any) {
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoadingData(false);
    }
  };

  const fetchPayment = async () => {
    if (!id || !user) return;

    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (data) {
        form.reset({
          siteId: data.site_id || "",
          clientId: data.client_id || "",
          amount: data.amount?.toString() || "",
          type: data.type as "deposit" | "progress" | "final",
          status: data.status as "pending" | "paid",
          dueDate: data.due_date ? new Date(data.due_date).toISOString().split("T")[0] : "",
          paidDate: data.paid_date ? new Date(data.paid_date).toISOString().split("T")[0] : "",
        });
      }
    } catch (error: any) {
      toast.error("Erreur lors du chargement du paiement");
      navigate("/payments");
    }
  };

  // Quand un chantier est sélectionné, remplir automatiquement le client
  const handleSiteChange = (siteId: string) => {
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      form.setValue("clientId", site.client_id);
      // Calculer le montant restant à payer
      const remaining = site.total_amount - site.paid_amount;
      if (remaining > 0) {
        form.setValue("amount", remaining.toString());
      }
    }
  };

  const onSubmit = async (values: PaymentFormData) => {
    if (!user) return;

    try {
      const paymentData = {
        user_id: user.id,
        site_id: values.siteId,
        client_id: values.clientId,
        amount: parseFloat(values.amount),
        type: values.type,
        status: values.status,
        due_date: values.dueDate ? new Date(values.dueDate).toISOString() : null,
        paid_date: values.status === "paid" && values.paidDate ? new Date(values.paidDate).toISOString() : null,
      };

      if (id) {
        const { error } = await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;
        toast.success("Paiement modifié avec succès");
      } else {
        const { error } = await supabase.from("payments").insert([paymentData]);

        if (error) throw error;

        // Mettre à jour le montant payé du chantier si le paiement est marqué comme payé
        if (values.status === "paid") {
          const site = sites.find((s) => s.id === values.siteId);
          if (site) {
            const newPaidAmount = site.paid_amount + parseFloat(values.amount);
            await supabase
              .from("sites")
              .update({ paid_amount: newPaidAmount })
              .eq("id", values.siteId);
          }
        }

        toast.success("Paiement créé avec succès");
      }

      navigate("/payments");
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
          onClick={() => navigate("/payments")}
          className="mb-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">
          {id ? "Modifier le paiement" : "Nouveau paiement"}
        </h1>
      </header>

      <div className="p-4">
        <Card>
          <CardHeader>
            <CardTitle>Informations du paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Chantier</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleSiteChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un chantier" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {sites.map((site) => {
                            const remaining = site.total_amount - site.paid_amount;
                            return (
                              <SelectItem key={site.id} value={site.id}>
                                {site.title} - Reste: {remaining.toFixed(2)}€
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Le client sera automatiquement rempli
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
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant (€)</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="1000.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type de paiement</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="deposit">Acompte</SelectItem>
                          <SelectItem value="progress">Avancement</SelectItem>
                          <SelectItem value="final">Solde</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Statut</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">En attente</SelectItem>
                          <SelectItem value="paid">Payé</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date d'échéance (optionnel)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paidDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date de paiement {form.watch("status") === "paid" && "*"}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            disabled={form.watch("status") !== "paid"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Chargement..." : id ? "Modifier" : "Créer"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
};

export default PaymentForm;

