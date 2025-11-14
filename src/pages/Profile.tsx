import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Mail, Phone, Globe, User, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useCompanyProfile, useUpsertCompanyProfile } from '@/hooks/useCompanyProfile';
import MobileNav from '@/components/MobileNav';

export default function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useCompanyProfile();
  const upsertProfile = useUpsertCompanyProfile();

  const [formData, setFormData] = useState({
    company_name: '',
    siret: '',
    tva_number: '',
    is_auto_entrepreneur: false,
    address: '',
    address_complement: '',
    postal_code: '',
    city: '',
    country: 'France',
    email: '',
    phone: '',
    website: '',
    first_name: '',
    last_name: '',
    logo_url: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        company_name: profile.company_name || '',
        siret: profile.siret || '',
        tva_number: profile.tva_number || '',
        is_auto_entrepreneur: profile.is_auto_entrepreneur || false,
        address: profile.address || '',
        address_complement: profile.address_complement || '',
        postal_code: profile.postal_code || '',
        city: profile.city || '',
        country: profile.country || 'France',
        email: profile.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        logo_url: profile.logo_url || '',
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    upsertProfile.mutate(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pb-20">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4 sticky top-0 z-10 shadow-md">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/more')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Profil d'entreprise
              </h1>
              <p className="text-sm text-primary-foreground/80">
                Informations pour vos documents
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                Informations de l'entreprise
              </CardTitle>
              <CardDescription>
                Ces informations apparaîtront sur vos factures et devis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">Nom de l'entreprise *</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => handleChange('company_name', e.target.value)}
                  placeholder="Ex: Jardin Chef"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siret">Numéro SIRET</Label>
                  <Input
                    id="siret"
                    value={formData.siret}
                    onChange={(e) => handleChange('siret', e.target.value)}
                    placeholder="123 456 789 00012"
                    maxLength={14}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tva_number">Numéro de TVA</Label>
                  <Input
                    id="tva_number"
                    value={formData.tva_number}
                    onChange={(e) => handleChange('tva_number', e.target.value)}
                    placeholder="FR12345678901"
                    disabled={formData.is_auto_entrepreneur}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="is_auto_entrepreneur">Auto-entrepreneur</Label>
                  <p className="text-sm text-muted-foreground">
                    Cochez si vous êtes en régime auto-entrepreneur
                  </p>
                </div>
                <Switch
                  id="is_auto_entrepreneur"
                  checked={formData.is_auto_entrepreneur}
                  onCheckedChange={(checked) => {
                    handleChange('is_auto_entrepreneur', checked);
                    if (checked) {
                      handleChange('tva_number', '');
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Rue des Jardins"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address_complement">Complément d'adresse</Label>
                <Input
                  id="address_complement"
                  value={formData.address_complement}
                  onChange={(e) => handleChange('address_complement', e.target.value)}
                  placeholder="Bâtiment A, Porte 2"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={(e) => handleChange('postal_code', e.target.value)}
                    placeholder="75001"
                    maxLength={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Paris"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    placeholder="France"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@jardinchef.fr"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="06 12 34 56 78"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.jardinchef.fr"
                />
              </div>
            </CardContent>
          </Card>

          {/* Owner Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Gérant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    placeholder="Jean"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    placeholder="Dupont"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate('/more')}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={upsertProfile.isPending || !formData.company_name}
            >
              {upsertProfile.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>

      <MobileNav />
    </div>
  );
}

