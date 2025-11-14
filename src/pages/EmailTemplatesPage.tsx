import { EmailTemplates } from '@/components/EmailTemplates';
import { MobileNav } from '@/components/MobileNav';
import { Mail } from 'lucide-react';

const EmailTemplatesPage = () => {
  return (
    <div className="container mx-auto p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <Mail className="h-8 w-8 text-primary" />
          Templates d'emails
        </h1>
        <p className="text-muted-foreground mt-2">
          Créez et gérez vos templates d'emails pour factures, devis, rappels et plus encore
        </p>
      </div>

      <EmailTemplates />

      <MobileNav />
    </div>
  );
};

export default EmailTemplatesPage;

