/**
 * Service d'import de données depuis Excel et CSV
 */
import * as XLSX from 'xlsx';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Importe des clients depuis un fichier Excel ou CSV
 */
export async function importClients(file: File, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Utilisateur non authentifié');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Impossible de lire le fichier');
        }

        // Lire le fichier Excel/CSV
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Le fichier est vide');
        }

        // Mapper les colonnes (flexible pour différents formats)
        const clients = jsonData.map((row: any) => {
          // Chercher les colonnes par différents noms possibles
          const firstName = row['Prénom'] || row['Prenom'] || row['first_name'] || row['First Name'] || '';
          const lastName = row['Nom'] || row['Last Name'] || row['last_name'] || '';
          const phone = row['Téléphone'] || row['Telephone'] || row['Phone'] || row['phone'] || '';
          const email = row['Email'] || row['email'] || '';
          const address = row['Adresse'] || row['Address'] || row['address'] || '';

          if (!firstName || !lastName) {
            throw new Error('Les colonnes "Prénom" et "Nom" sont obligatoires');
          }

          return {
            user_id: userId,
            first_name: String(firstName).trim(),
            last_name: String(lastName).trim(),
            phone: String(phone || '').trim(),
            email: String(email || '').trim(),
            address: String(address || '').trim(),
          };
        });

        // Insérer les clients dans la base de données
        const { error } = await supabase
          .from('clients')
          .insert(clients);

        if (error) {
          throw error;
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    // Lire le fichier
    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

/**
 * Importe des devis depuis un fichier Excel ou CSV
 */
export async function importQuotes(file: File, userId: string): Promise<void> {
  if (!userId) {
    throw new Error('Utilisateur non authentifié');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          throw new Error('Impossible de lire le fichier');
        }

        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Le fichier est vide');
        }

        // Récupérer tous les clients pour faire le mapping
        const { data: allClients } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .eq('user_id', userId);

        const quotes = await Promise.all(
          jsonData.map(async (row: any) => {
            const title = row['Titre'] || row['Title'] || row['title'] || '';
            const description = row['Description'] || row['description'] || '';
            const amount = parseFloat(row['Montant HT (€)'] || row['Montant'] || row['Amount'] || row['amount'] || '0');
            const status = row['Statut'] || row['Status'] || row['status'] || 'draft';
            const clientName = row['Client'] || row['client'] || '';

            if (!title || !amount) {
              throw new Error('Les colonnes "Titre" et "Montant HT (€)" sont obligatoires');
            }

            // Trouver le client par nom
            let clientId = '';
            if (clientName && allClients) {
              const [firstName, ...lastNameParts] = clientName.split(' ');
              const lastName = lastNameParts.join(' ');
              const client = allClients.find(
                (c) => c.first_name === firstName && c.last_name === lastName
              );
              if (client) {
                clientId = client.id;
              }
            }

            if (!clientId) {
              throw new Error(`Client non trouvé pour: ${clientName}`);
            }

            return {
              user_id: userId,
              client_id: clientId,
              title: String(title).trim(),
              description: String(description || '').trim(),
              amount,
              status: status.toLowerCase(),
            };
          })
        );

        const { error } = await supabase.from('quotes').insert(quotes);

        if (error) {
          throw error;
        }

        resolve();
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Erreur lors de la lecture du fichier'));
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file, 'UTF-8');
    } else {
      reader.readAsBinaryString(file);
    }
  });
}

